#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stderr, stdout } from 'node:process';
import { readSecret, removeSecret, writeSecret } from '../src/keyring.mjs';
import { loadRegistry, saveRegistry, getRegistryPath } from '../src/registry.mjs';

const VERSION = '1.0.1';
const SECRET_FIELD_PATTERN = /(authorization|api[-_]?key|client[-_]?secret|cookie|password|refresh[-_]?token|secret|session|token)/i;
const VALID_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']);
const FORBIDDEN_HEADERS = new Set([
  'connection',
  'content-length',
  'cookie',
  'host',
  'proxy-authorization',
  'set-cookie',
  'transfer-encoding',
  'upgrade',
]);

function printHelp() {
  stdout.write(`kp-credential ${VERSION}

사용법:
  kp-credential add <항목이름>
  kp-credential list
  kp-credential info <항목이름>
  kp-credential open [항목이름]
  kp-credential grant <항목이름> --origin <HTTPS_ORIGIN> --header <HEADER>
                       [--prefix <TEXT>] [--path-prefix </PATH>] [--methods GET,HEAD]
  kp-credential revoke <항목이름> --origin <HTTPS_ORIGIN>
                        [--path-prefix </PATH>] [--header <HEADER>]
  kp-credential request <항목이름> --url <HTTPS_URL> [--method GET]
                            [--body-file <PATH>] [--content-type <TYPE>]
  kp-credential delete <항목이름>
  kp-credential help

add는 비밀값을 숨겨 입력받습니다. 값 자체를 명령 인수로 전달하지 마세요.
에이전트의 비밀 사용은 승인된 HTTPS 요청을 중개합니다. 임의 명령에 값을 주입하지 않습니다.
`);
}

function fail(message, code = 1) {
  stderr.write(`kp-credential: ${message}\n`);
  process.exitCode = code;
}

function validateName(name) {
  if (typeof name !== 'string' || name.length < 1 || name.length > 120) {
    throw new Error('항목 이름은 1~120자여야 합니다.');
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(name) || name.includes('..')) {
    throw new Error('항목 이름은 영문자·숫자로 시작하고 영문자·숫자·점·밑줄·하이픈·슬래시만 사용할 수 있습니다.');
  }
  return name;
}

function parseFlags(args, allowed) {
  const flags = {};
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!flag.startsWith('--')) throw new Error('예상하지 못한 위치 인수가 있습니다.');
    const key = flag.slice(2);
    if (!allowed.has(key)) throw new Error('지원하지 않는 옵션이 있습니다.');
    if (flags[key] !== undefined) throw new Error('옵션을 중복 지정했습니다.');
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${flag} 뒤에 값을 지정해 주세요.`);
    flags[key] = value;
    index += 1;
  }
  return flags;
}

function requireTty(action) {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error(`${action}은 사용자가 직접 여는 대화형 터미널에서 실행해 주세요.`);
  }
}

async function promptLine(question) {
  requireTty('확인');
  const rl = createInterface({ input: stdin, output: stderr, terminal: true });
  try {
    return await rl.question(question);
  } finally {
    rl.close();
  }
}

async function promptHidden(question) {
  requireTty('비밀값 입력');
  stderr.write(question);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stderr.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') return finish(new Error('입력이 취소되었습니다.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') {
          value = Array.from(value).slice(0, -1).join('');
          continue;
        }
        if (character >= ' ') value += character;
      }
    };

    stdin.on('data', onData);
  });
}

function normalizeOrigin(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('origin은 https://host 형식이어야 합니다.');
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('origin에는 scheme과 host만 지정해 주세요.');
  }
  ensureSecureProtocol(url);
  return url.origin;
}

function ensureSecureProtocol(url) {
  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
    throw new Error('비밀값은 HTTPS로만 전송합니다. HTTP는 localhost에서만 허용합니다.');
  }
}

function normalizePathPrefix(value) {
  if (!value.startsWith('/') || value.includes('?') || value.includes('#') || value.includes('\\')) {
    throw new Error('path-prefix는 /로 시작하는 경로만 사용할 수 있습니다.');
  }
  const segments = value.split('/');
  if (segments.includes('..') || segments.includes('.')) throw new Error('path-prefix에 상대 경로를 사용할 수 없습니다.');
  return value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
}

function validateHeader(header) {
  if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(header)) throw new Error('유효한 HTTP header 이름이 아닙니다.');
  const lower = header.toLowerCase();
  if (FORBIDDEN_HEADERS.has(lower) || lower.startsWith('sec-')) {
    throw new Error('해당 HTTP header에는 비밀값을 넣을 수 없습니다.');
  }
  return header;
}

function normalizePrefix(prefix = '') {
  if (/[\r\n]/.test(prefix) || prefix.length > 48) throw new Error('header prefix가 유효하지 않습니다.');
  return prefix;
}

function normalizeMethods(value = 'GET,HEAD') {
  const methods = [...new Set(value.split(',').map((method) => method.trim().toUpperCase()).filter(Boolean))];
  if (methods.length === 0 || methods.some((method) => !VALID_METHODS.has(method))) {
    throw new Error(`허용 가능한 method는 ${[...VALID_METHODS].join(', ')}입니다.`);
  }
  return methods.sort();
}

function pathMatches(pathname, prefix) {
  if (prefix === '/') return true;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function validateRequestUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('유효한 --url을 지정해 주세요.');
  }
  if (url.username || url.password || url.hash) throw new Error('URL에 사용자 정보나 fragment를 넣을 수 없습니다.');
  ensureSecureProtocol(url);
  for (const key of url.searchParams.keys()) {
    if (SECRET_FIELD_PATTERN.test(key)) throw new Error('token·key·secret·password가 포함된 query parameter는 허용하지 않습니다.');
  }
  return url;
}

function redactText(text, secret) {
  let result = text;
  for (const candidate of secretRepresentations(secret)) {
    if (candidate) result = result.split(candidate).join('[REDACTED]');
  }
  return result;
}

function secretRepresentations(secret) {
  const candidates = new Set([secret]);
  if (secret.length >= 8) {
    const bytes = Buffer.from(secret, 'utf8');
    candidates.add(encodeURIComponent(secret));
    candidates.add(new URLSearchParams({ value: secret }).toString().slice('value='.length));
    candidates.add(bytes.toString('base64'));
    candidates.add(bytes.toString('base64url'));
    candidates.add(bytes.toString('hex'));
  }
  return candidates;
}

function urlContainsCredential(url, secret) {
  if (secret.length < 8) return false;
  return [...secretRepresentations(secret)].some((candidate) => url.href.includes(candidate));
}

function redactJson(value, secret) {
  if (Array.isArray(value)) return value.map((item) => redactJson(item, secret));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      SECRET_FIELD_PATTERN.test(key) ? '[REDACTED]' : redactJson(item, secret),
    ]));
  }
  if (typeof value === 'string') return redactText(value, secret);
  return value;
}

async function readBodyLimited(response, maxBytes = 1024 * 1024) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error('응답이 1 MiB를 넘어서 중단했습니다.');
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function addSecret(name) {
  validateName(name);
  const secret = await promptHidden('저장할 비밀값을 입력하세요: ');
  if (!secret) throw new Error('빈 값은 저장하지 않습니다.');

  const registry = await loadRegistry();
  const exists = readSecret(name) !== null;
  if (exists) {
    const answer = await promptLine(`'${name}' 항목을 교체할까요? (y/N): `);
    if (answer.trim().toLowerCase() !== 'y') {
      process.stdout.write('저장하지 않았습니다.\n');
      return;
    }
  }

  writeSecret(name, secret);
  registry.entries[name] = {
    ...(registry.entries[name] ?? {}),
    createdAt: registry.entries[name]?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grants: registry.entries[name]?.grants ?? [],
  };
  await saveRegistry(registry);
  process.stdout.write(`저장했습니다: ${name}\n`);
}

async function listSecrets() {
  const registry = await loadRegistry();
  const names = Object.keys(registry.entries).sort();
  if (names.length === 0) {
    process.stdout.write('저장된 항목이 없습니다.\n');
    return;
  }
  for (const name of names) process.stdout.write(`${name}\n`);
}

async function inspectSecret(name) {
  validateName(name);
  const registry = await loadRegistry();
  const metadata = registry.entries[name];
  if (!metadata) throw new Error(`항목을 찾지 못했습니다: ${name}`);
  const exists = readSecret(name) !== null;
  process.stdout.write(`항목: ${name}\n저장소 값: ${exists ? '있음' : '없음'}\n`);
  process.stdout.write(`등록 시각: ${metadata.createdAt ?? '알 수 없음'}\n수정 시각: ${metadata.updatedAt ?? '알 수 없음'}\n`);
  const grants = metadata.grants ?? [];
  if (grants.length === 0) {
    process.stdout.write('사용 권한: 없음\n');
    return;
  }
  process.stdout.write('사용 권한:\n');
  for (const grant of grants) {
    process.stdout.write(`- ${grant.origin}${grant.pathPrefix === '/' ? '' : grant.pathPrefix}; ${grant.headerName}; ${grant.methods.join(', ')}\n`);
  }
}

async function openNativeManager(name) {
  if (name) {
    validateName(name);
    const registry = await loadRegistry();
    if (!registry.entries[name]) throw new Error(`항목을 찾지 못했습니다: ${name}`);
  }

  let command;
  let args;
  if (process.platform === 'darwin') {
    command = 'open';
    args = ['-a', 'Keychain Access'];
  } else if (process.platform === 'win32') {
    command = 'control.exe';
    args = ['/name', 'Microsoft.CredentialManager'];
  } else {
    throw new Error('현재 도구는 macOS Keychain과 Windows Credential Manager를 지원합니다.');
  }

  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
  process.stdout.write(name
    ? `OS 자격 증명 관리자를 열었습니다. 항목 이름 '${name}'으로 검색해 확인하세요.\n`
    : 'OS 자격 증명 관리자를 열었습니다.\n');
}

async function grantSecret(name, args) {
  validateName(name);
  const flags = parseFlags(args, new Set(['origin', 'header', 'prefix', 'path-prefix', 'methods']));
  if (!flags.origin || !flags.header) throw new Error('--origin과 --header가 필요합니다.');
  const origin = normalizeOrigin(flags.origin);
  const headerName = validateHeader(flags.header);
  const prefix = normalizePrefix(flags.prefix);
  const pathPrefix = normalizePathPrefix(flags['path-prefix'] ?? '/');
  const methods = normalizeMethods(flags.methods);

  const registry = await loadRegistry();
  const metadata = registry.entries[name];
  if (!metadata || readSecret(name) === null) throw new Error(`항목을 먼저 저장해 주세요: ${name}`);

  process.stderr.write(`\n비밀값 사용 권한을 요청합니다.\n항목: ${name}\nOrigin: ${origin}\n경로 범위: ${pathPrefix}\nHeader: ${headerName}${prefix ? ` (${prefix}...)` : ''}\nHTTP method: ${methods.join(', ')}\n`);
  const confirmation = await promptLine(`승인하려면 '${origin}'을 입력하세요: `);
  if (confirmation.trim() !== origin) throw new Error('권한 승인이 취소되었습니다.');

  const grant = { origin, pathPrefix, headerName, prefix, methods };
  const grants = metadata.grants ?? [];
  const index = grants.findIndex((item) => item.origin === origin
    && item.pathPrefix === pathPrefix
    && item.headerName.toLowerCase() === headerName.toLowerCase()
    && item.prefix === prefix);
  if (index >= 0) {
    grants[index] = { ...grant, methods: [...new Set([...grants[index].methods, ...methods])].sort() };
  } else {
    grants.push(grant);
  }
  metadata.grants = grants;
  await saveRegistry(registry);
  process.stdout.write(`사용 권한을 저장했습니다: ${name} → ${origin}${pathPrefix}\n`);
}

async function revokeSecret(name, args) {
  validateName(name);
  const flags = parseFlags(args, new Set(['origin', 'path-prefix', 'header']));
  if (!flags.origin) throw new Error('--origin이 필요합니다.');
  const origin = normalizeOrigin(flags.origin);
  const pathPrefix = flags['path-prefix'] === undefined ? null : normalizePathPrefix(flags['path-prefix']);
  const headerName = flags.header === undefined ? null : validateHeader(flags.header).toLowerCase();

  const registry = await loadRegistry();
  const metadata = registry.entries[name];
  if (!metadata) throw new Error(`항목을 찾지 못했습니다: ${name}`);
  const grants = metadata.grants ?? [];
  const matches = grants.filter((grant) => grant.origin === origin
    && (pathPrefix === null || grant.pathPrefix === pathPrefix)
    && (headerName === null || grant.headerName.toLowerCase() === headerName));
  if (matches.length === 0) throw new Error('지정한 범위의 사용 권한이 없습니다.');

  const scopeDescription = matches.map((grant) => `${grant.pathPrefix}; ${grant.headerName}; ${grant.methods.join(', ')}`).join('\n');
  process.stderr.write(`\n다음 사용 권한을 취소합니다.\n항목: ${name}\nOrigin: ${origin}\n${scopeDescription}\n`);
  const confirmation = await promptLine(`취소하려면 '${origin}'을 입력하세요: `);
  if (confirmation.trim() !== origin) throw new Error('권한 취소가 중단되었습니다.');

  metadata.grants = grants.filter((grant) => !matches.includes(grant));
  await saveRegistry(registry);
  process.stdout.write(`사용 권한을 취소했습니다: ${name} → ${origin}\n`);
}

async function requestWithSecret(name, args) {
  validateName(name);
  const flags = parseFlags(args, new Set(['url', 'method', 'body-file', 'content-type']));
  if (!flags.url) throw new Error('--url이 필요합니다.');
  const url = validateRequestUrl(flags.url);
  const method = (flags.method ?? 'GET').toUpperCase();
  if (!VALID_METHODS.has(method)) throw new Error('지원하지 않는 HTTP method입니다.');

  const registry = await loadRegistry();
  const metadata = registry.entries[name];
  if (!metadata) throw new Error(`항목을 찾지 못했습니다: ${name}`);
  const secret = readSecret(name);
  if (secret === null) throw new Error(`OS 저장소에서 값을 찾지 못했습니다: ${name}`);
  if (urlContainsCredential(url, secret)) throw new Error('요청 URL에 저장된 credential이 포함된 것으로 판단되어 요청을 중단했습니다.');

  const matching = (metadata.grants ?? []).filter((grant) => grant.origin === url.origin
    && grant.methods.includes(method)
    && pathMatches(url.pathname, grant.pathPrefix));
  if (matching.length === 0) {
    throw new Error(`승인된 사용 범위가 없습니다. 사용자에게 ${url.origin}${url.pathname} ${method} 요청 권한을 승인해 달라고 안내하세요.`);
  }
  if (matching.length > 1) throw new Error('요청과 일치하는 권한이 여러 개입니다. 중복 grant를 정리해 주세요.');

  const grant = matching[0];

  let body;
  const headers = new Headers({ accept: 'application/json, text/plain;q=0.9, */*;q=0.8' });
  headers.set(grant.headerName, `${grant.prefix}${secret}`);
  if (flags['body-file']) {
    if (method === 'GET' || method === 'HEAD') throw new Error(`${method} 요청에는 --body-file을 사용할 수 없습니다.`);
    body = await fs.readFile(flags['body-file']);
    if (flags['content-type']) headers.set('content-type', flags['content-type']);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
    const rawBody = await readBodyLimited(response);
    const contentType = response.headers.get('content-type') ?? '';
    let safeBody;
    if (contentType.toLowerCase().includes('json')) {
      try {
        safeBody = JSON.stringify(redactJson(JSON.parse(rawBody), secret));
      } catch {
        safeBody = redactText(rawBody, secret);
      }
    } else {
      safeBody = redactText(rawBody, secret);
    }
    stdout.write(`${JSON.stringify({ status: response.status, contentType, body: safeBody })}\n`);
  } catch (error) {
    const code = error?.cause?.code;
    throw new Error(code ? `요청을 완료하지 못했습니다. 네트워크 오류 코드: ${code}` : '요청을 완료하지 못했습니다.');
  } finally {
    headers.delete(grant.headerName);
  }
}

async function deleteSecret(name) {
  validateName(name);
  const registry = await loadRegistry();
  if (!registry.entries[name]) throw new Error(`항목을 찾지 못했습니다: ${name}`);
  const confirmation = await promptLine(`삭제하려면 '${name}'을 입력하세요: `);
  if (confirmation.trim() !== name) throw new Error('삭제가 취소되었습니다.');

  removeSecret(name);
  delete registry.entries[name];
  await saveRegistry(registry);
  process.stdout.write(`삭제했습니다: ${name}\n`);
}

async function main(argv) {
  const [command, name, ...args] = argv;
  if (!command || command === 'help' || command === '--help' || command === '-h') return printHelp();
  if (command === '--version' || command === '-v' || command === 'version') {
    stdout.write(`${VERSION}\n`);
    return;
  }
  if (command === 'list') {
    if (name) throw new Error('list에는 항목 이름을 지정하지 않습니다.');
    return listSecrets();
  }
  if (command === 'add') {
    if (!name || args.length > 0) throw new Error('사용법: kp-credential add <항목이름> — 실제 비밀값은 명령 인수로 전달하지 마세요.');
    return addSecret(name);
  }
  if (command === 'info') {
    if (!name || args.length > 0) throw new Error('사용법: kp-credential info <항목이름>');
    return inspectSecret(name);
  }
  if (command === 'open') {
    if (args.length > 0) throw new Error('사용법: kp-credential open [항목이름]');
    return openNativeManager(name);
  }
  if (command === 'grant') {
    if (!name) throw new Error('사용법: kp-credential grant <항목이름> --origin <HTTPS_ORIGIN> --header <HEADER>');
    return grantSecret(name, args);
  }
  if (command === 'revoke') {
    if (!name) throw new Error('사용법: kp-credential revoke <항목이름> --origin <HTTPS_ORIGIN> [--path-prefix <PATH>] [--header <HEADER>]');
    return revokeSecret(name, args);
  }
  if (command === 'request') {
    if (!name) throw new Error('사용법: kp-credential request <항목이름> --url <HTTPS_URL>');
    return requestWithSecret(name, args);
  }
  if (command === 'delete') {
    if (!name || args.length > 0) throw new Error('사용법: kp-credential delete <항목이름>');
    return deleteSecret(name);
  }
  if (command === 'where') {
    if (name || args.length > 0) throw new Error('사용법: kp-credential where');
    process.stdout.write(`${getRegistryPath()}\n`);
    return;
  }
  throw new Error('알 수 없는 명령입니다. kp-credential help를 확인해 주세요.');
}

main(process.argv.slice(2)).catch((error) => {
  fail(error?.message ?? '요청을 완료하지 못했습니다.');
});
