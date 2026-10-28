#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { appendFile, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(path.join(skillDir, 'package.json'), 'utf8'));
const platform = process.platform;
const isWindows = platform === 'win32';

function fail(message) {
  console.error(`kp-credential 설치 실패: ${message}`);
  process.exit(1);
}

if (!['darwin', 'win32'].includes(platform)) {
  fail('macOS와 Windows만 지원합니다.');
}

const requiredNodeMajor = Number(packageJson.engines?.node?.match(/\d+/)?.[0] ?? 20);
const currentNodeMajor = Number(process.versions.node.split('.')[0]);
if (currentNodeMajor < requiredNodeMajor) {
  fail(`Node.js ${requiredNodeMajor} 이상이 필요합니다. 현재 버전은 ${process.versions.node}입니다.`);
}

function run(command, args, { cwd, env = process.env, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    shell: isWindows,
    windowsHide: true,
  });

  if (result.error) {
    if (allowFailure) return null;
    fail(result.error.message);
  }
  if (result.status !== 0) {
    if (allowFailure) return null;
    const details = (result.stderr || result.stdout || '').trim();
    fail(details || `${command}가 종료 코드 ${result.status}를 반환했습니다.`);
  }
  return (result.stdout || '').trim();
}

const npm = isWindows ? 'npm.cmd' : 'npm';
const globalPrefix = run(npm, ['prefix', '--global']);
const globalBin = isWindows ? globalPrefix : path.join(globalPrefix, 'bin');
const cliPath = isWindows
  ? path.join(globalBin, 'kp-credential.cmd')
  : path.join(globalBin, 'kp-credential');

function readInstalledVersion() {
  const output = run(cliPath, ['--version'], { allowFailure: true });
  return output?.split(/\r?\n/).at(-1)?.trim() ?? null;
}

async function installFromSkillTarball() {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'kp-credential-install-'));
  try {
    run(npm, ['pack', '--pack-destination', tempDir, '--silent', skillDir]);
    const entries = await readdir(tempDir);
    const tarballName = entries.find((entry) => entry.endsWith('.tgz'));
    if (!tarballName) fail('npm pack이 CLI tarball을 만들지 않았습니다.');
    run(npm, ['install', '--global', path.join(tempDir, tarballName)]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

async function ensureMacPath() {
  const shell = path.basename(process.env.SHELL || 'zsh');
  let startupFiles;
  let block;

  if (shell === 'zsh') {
    startupFiles = ['.zshrc', '.zprofile'];
    block = [
      '# kp-credential npm global command path',
      'typeset -U path PATH',
      `path=(${shellQuote(globalBin)} $path)`,
    ].join('\n');
  } else if (shell === 'bash') {
    startupFiles = ['.bashrc', '.bash_profile'];
    block = [
      '# kp-credential npm global command path',
      `case ":$PATH:" in *:${shellQuote(globalBin)}:*) ;; *) export PATH=${shellQuote(globalBin)}:"$PATH" ;; esac`,
    ].join('\n');
  } else {
    fail(`자동 PATH 설정은 zsh와 bash를 지원합니다. 현재 shell: ${shell}`);
  }

  for (const filename of startupFiles) {
    const filePath = path.join(homedir(), filename);
    let content = '';
    try {
      content = await readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (content.includes('kp-credential npm global command path') || content.includes(globalBin)) continue;
    await appendFile(filePath, `${content.trimEnd()}${content.trim() ? '\n\n' : ''}${block}\n`, 'utf8');
  }
}

function ensureWindowsPath() {
  const escapedBin = globalBin.replaceAll("'", "''");
  const script = [
    `$entry = '${escapedBin}'`,
    `$current = [Environment]::GetEnvironmentVariable('Path', 'User')`,
    `$parts = @($current -split ';' | Where-Object { $_ })`,
    `$found = @($parts | Where-Object { $_.TrimEnd('\\') -ieq $entry.TrimEnd('\\') }).Count -gt 0`,
    `if (-not $found) { [Environment]::SetEnvironmentVariable('Path', (($parts + $entry) -join ';'), 'User') }`,
  ].join('; ');
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  run('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
}

const installedVersion = readInstalledVersion();
if (installedVersion !== packageJson.version) {
  installFromSkillTarball();
}

const finalVersion = readInstalledVersion();
if (finalVersion !== packageJson.version) {
  fail(`설치된 CLI 버전 ${finalVersion ?? '확인 불가'}가 package.json 버전 ${packageJson.version}과 다릅니다.`);
}

if (platform === 'darwin') await ensureMacPath();
else ensureWindowsPath();

const currentPathEntries = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
if (!currentPathEntries.includes(globalBin)) {
  process.env.PATH = [globalBin, ...currentPathEntries].join(path.delimiter);
}

const commandVersion = run('kp-credential', ['--version'], { allowFailure: true })
  ?.split(/\r?\n/)
  .at(-1)
  ?.trim();
if (commandVersion !== packageJson.version) {
  fail(`PATH에서 찾은 kp-credential 버전 ${commandVersion ?? '확인 불가'}가 package.json 버전 ${packageJson.version}과 다릅니다.`);
}

console.log(`kp-credential CLI ${finalVersion}이 OS 사용자 환경에 준비되었습니다.`);
console.log('기존 터미널은 PATH 설정을 다시 불러오지 않으므로 새 터미널에서 명령을 사용하세요.');
