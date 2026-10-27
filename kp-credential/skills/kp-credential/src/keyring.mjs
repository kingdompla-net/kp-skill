import { Entry } from '@napi-rs/keyring';

const SERVICE = 'com.kingdomplanet.kp-credential';

function entryFor(name) {
  return new Entry(SERVICE, name);
}

export function readSecret(name) {
  try {
    return entryFor(name).getPassword();
  } catch {
    throw new Error('OS 자격 증명 저장소에서 값을 읽지 못했습니다. 잠금 상태와 접근 권한을 확인해 주세요.');
  }
}

export function writeSecret(name, value) {
  try {
    entryFor(name).setPassword(value);
  } catch {
    throw new Error('OS 자격 증명 저장소에 값을 저장하지 못했습니다. 잠금 상태와 접근 권한을 확인해 주세요.');
  }
}

export function removeSecret(name) {
  try {
    return entryFor(name).deletePassword();
  } catch {
    throw new Error('OS 자격 증명 저장소에서 값을 삭제하지 못했습니다. 잠금 상태와 접근 권한을 확인해 주세요.');
  }
}
