---
name: kp-credential
description: "로컬 OS 자격 증명 저장소의 API credential을 숨김 입력으로 저장하고, 승인 범위에서 목록·상태·권한·요청을 관리할 때 사용합니다."
metadata:
  version: "1.1.0"
---

# KP 로컬 API credential 관리

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 manager 정본을 읽고 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

`kp-credential` CLI로 macOS Keychain 또는 Windows Credential Manager에 저장된 API header credential을 관리합니다. 비밀값을 대화나 명령 인수로 받거나 출력하지 않습니다.

## 절차

1. 요청한 작업이 API header credential인지 확인합니다. 임의 CLI 환경 변수나 브라우저 로그인 값은 이 도구로 전달하지 않습니다.
2. `kp-credential` Skill이 앱/API dependency로 설치될 때 CLI도 OS 사용자 환경에 함께 설치되어 있어야 합니다. 작업 시작 시 `kp-credential --version`과 일반 명령 탐색을 확인하고, 수동 복사 등으로 빠졌거나 오래된 경우 공통 reference의 설치 절차로 먼저 복구합니다. 저장소 clone, 경로 입력, CLI 설치 명령 실행을 사용자에게 요구하지 않습니다.
3. 값 저장 요청이면 `kp-credential add <항목라벨>`을 안내합니다. 실제 값은 CLI의 숨김 입력에 사용자가 직접 입력하며, 명령 뒤에 붙이거나 대화로 보내지 않습니다.
4. API 사용은 공식 계약에서 확인한 HTTPS origin, path, method, header만 `kp-credential grant`로 승인합니다. 범위가 확인되지 않으면 추측하지 말고 먼저 비밀이 아닌 API 정보를 확인합니다.
5. 승인한 범위 안에서만 `kp-credential request <항목라벨> --url <HTTPS_URL>`을 실행합니다. 값은 반환하지 않으며, 응답 본문에 비밀이나 민감정보가 포함되지 않도록 결과를 검토합니다.
6. 목록, 정보 확인, OS 자격 증명 관리자 열기, 권한 취소, 삭제는 각각 `list`, `info`, `open`, `revoke`, `delete` 명령을 사용합니다. 값이 화면이나 최종 답변에 나오도록 요청하지 않습니다.

사용자가 저장을 마친 뒤에는 항목 라벨과 저장·승인 완료 여부만 확인합니다. 기존 credential이나 권한을 변경·삭제하기 전에는 대상 항목과 범위를 정확히 확인합니다.

## OS 판별과 에이전트의 사용 방식

CLI package는 이 Skill 폴더에 함께 배포됩니다. 앱/API Skill 설치 절차는 설치된 Skill의 `scripts/install-global.mjs`를 실행해 package를 OS 사용자 전역 npm 환경에 설치하고, `kp-credential --version`과 일반 명령 탐색을 확인합니다. Helper는 실행 경로가 OS 사용자 PATH에 없으면 macOS zsh/bash 설정 또는 Windows 사용자 PATH를 중복 없이 자동 보완합니다. 프로젝트 Skill 폴더 자체를 전역 링크하지 않습니다. 사용자가 저장소 clone, 설치 경로 입력, CLI 설치 명령 실행을 준비할 필요는 없습니다. Node.js/npm이 없거나 npm 전역 prefix에 쓰기 권한이 없어 설치가 실패하면 원인과 조치를 설명하고, 사용자 계정에 쓰기 가능한 npm prefix가 준비된 뒤 자동으로 다시 시도합니다. 권한 오류를 우회하려고 `sudo npm`을 실행하지 않습니다.

CLI의 keyring backend는 macOS에서는 Keychain, Windows에서는 Credential Manager를 자동 사용합니다. `open`도 macOS에서는 Keychain Access를, Windows에서는 Credential Manager 제어판을 엽니다. OS를 사용자에게 다시 묻지 말고 현재 실행 환경을 확인합니다. macOS와 Windows만 지원하며 Linux와 기타 OS는 다른 저장소로 우회하지 않습니다.

에이전트는 OS keyring을 직접 열거나 비밀값을 읽어 출력하지 않습니다. 사용자가 항목을 저장하고 범위를 승인한 뒤 `kp-credential request <항목라벨> --url <HTTPS_URL>`을 실행해 승인된 HTTPS API 요청을 합니다. CLI가 keyring에서 값을 읽어 승인된 header에만 넣고, 값 자체는 출력하지 않습니다. 에이전트에는 HTTP 응답이 반환되므로 자격 증명을 반사하거나 변환해 반환할 수 있는 endpoint에는 권한을 승인하지 않습니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| CLI | `kp-credential` | dependency 설치 단계에서 이 Skill의 package tarball을 OS 사용자 전역 npm 환경에 설치·갱신합니다. 값 저장은 `kp-credential add <항목라벨>`, 목록·확인은 `kp-credential list`와 `kp-credential info <항목라벨>`, OS 저장소 열기는 `kp-credential open <항목라벨>`, 범위 승인은 `kp-credential grant <항목라벨> --origin <HTTPS_ORIGIN> --path-prefix <PATH> --header <HEADER> --methods <METHODS>`, 요청은 `kp-credential request <항목라벨> --url <HTTPS_URL>`입니다. | [CLI 안내](CLI.md) |
| 기타 | macOS Keychain·Windows Credential Manager | 비밀값을 OS 자격 증명 저장소에 보관합니다. 항목 이름과 승인 범위만 비밀이 아닌 registry에 저장합니다. | [저장소와 보안 경계](CLI.md#저장-위치와-보안-경계) |

## 저장 범위

- OS 저장소는 컴퓨터마다 별도입니다. 다른 컴퓨터에서도 사용하려면 그 컴퓨터에서 CLI를 설치하고 credential을 다시 입력합니다.
