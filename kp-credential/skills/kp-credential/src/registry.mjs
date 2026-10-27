import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const REGISTRY_VERSION = 1;

function registryDirectory() {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'kp-credential');
  }

  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'), 'kp-credential');
  }

  const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(configHome, 'kp-credential');
}

const registryPath = path.join(registryDirectory(), 'registry.json');

async function ensurePrivateDirectory() {
  await fs.mkdir(path.dirname(registryPath), { recursive: true, mode: 0o700 });
  const stat = await fs.lstat(path.dirname(registryPath));
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error('kp-credential 데이터 경로가 일반 디렉터리가 아닙니다.');
  }
  if (process.platform !== 'win32') await fs.chmod(path.dirname(registryPath), 0o700);
}

export async function loadRegistry() {
  await ensurePrivateDirectory();

  try {
    const stat = await fs.lstat(registryPath);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error('kp-credential registry가 일반 파일이 아닙니다.');
    }

    const raw = await fs.readFile(registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.version !== REGISTRY_VERSION || !parsed.entries || typeof parsed.entries !== 'object') {
      throw new Error('kp-credential registry 형식을 지원하지 않습니다.');
    }
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return { version: REGISTRY_VERSION, entries: {} };
    throw error;
  }
}

export async function saveRegistry(registry) {
  await ensurePrivateDirectory();
  const temporaryPath = `${registryPath}.${process.pid}.${Date.now()}.tmp`;
  const handle = await fs.open(temporaryPath, 'wx', 0o600);

  try {
    await handle.writeFile(`${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }

  try {
    await fs.rename(temporaryPath, registryPath);
    if (process.platform !== 'win32') await fs.chmod(registryPath, 0o600);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true });
    throw error;
  }
}

export function getRegistryPath() {
  return registryPath;
}
