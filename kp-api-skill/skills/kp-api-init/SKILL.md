---
name: kp-api-init
description: "KP Firebase Functions 저장소에 새 도메인 codebase와 최초 HTTP router를 설계하고, 환경별 실행·배포 지침을 준비할 때 사용합니다."
metadata:
  version: "1.1.0"
---

# KP API 코드베이스 초기화

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

새 도메인의 Firebase Functions codebase와 첫 HTTP router를 기존 KP API 저장소 패턴에 맞춰 준비합니다. 먼저 [저장소 전체 패턴 분석](references/api-project-architecture.md)을 읽고, QT 단일 사례와 공통 구조를 구분합니다. 기존 Firebase 설정·스크립트·인증 계약을 보존하며, 다른 도메인의 함수를 복사하거나 무관한 리팩터링을 하지 않습니다.

## 시작 확인

1. Git 저장소 루트, 적용되는 `AGENTS.md`, branch와 `git status --short --branch`를 확인합니다. 미커밋 파일과 미추적 파일을 보존합니다.
2. 이미 운영 중인 API repository인지 확인합니다. 기존 codebase와 router가 있으면 재초기화하지 말고 `kp-api-endpoint`, `kp-api-worker` 또는 `kp-api-build`로 라우팅합니다.
3. `firebase.json`, `.firebaserc`, root와 도메인별 `package.json`, 함수 export, 테스트·lint·format script, 배포 설정을 확인합니다. Firebase CLI 버전과 Functions 1세대·2세대 사용 여부도 확인합니다.
4. 새 도메인/codebase 이름, router export, region, DEV·PRD Firebase project ID, API 인증 방식처럼 코드나 사용자의 요청에서 확인할 수 없는 값을 구분합니다. 프로젝트 ID와 권한은 별도로 확인하고 비밀번호나 token을 요청하지 않습니다.
5. 새로 작성하거나 수정하는 한국어 문서는 존댓말로 작성합니다. 생성할 `AGENTS.md`, API 문서, 운영 지침과 주석 설명도 같은 문체로 맞춥니다. 기존 repository가 영문 README를 유지하는 등 다른 언어를 명시한 경우에는 해당 언어 체계를 따릅니다.

## Codebase와 router 준비

- 도메인별 Functions source와 고유 `codebase`를 준비합니다. 기존 `firebase.json`이 여러 codebase를 관리하면 관련 항목만 추가하고 다른 항목을 재정렬하거나 삭제하지 않습니다.
- HTTP router는 도메인 path prefix, region, timeout, memory, max instances, concurrency를 실제 예상 트래픽과 외부 호출에 맞춥니다. 모든 endpoint마다 별도 Cloud Function을 만들지 말고 기존 도메인 router에 handler를 등록합니다.
- 공통 인증·오류 wrapper는 같은 repository의 실제 구현을 읽고 사용합니다. API key 인증, KP 로그인 사용자 token, 공개 endpoint를 서로 바꾸어 쓰지 않습니다.
- request와 response schema는 기존 validation library 및 오류 계약을 따릅니다. method, 인증, 권한, 알 수 없는 body field 처리와 부작용을 계약에 기록합니다.
- 새 codebase의 `AGENTS.md`는 [템플릿](assets/templates/AGENTS.md)을 실제 구조에 맞춰 사용합니다. 기존 지침을 덮어쓰지 말고 병합합니다. 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 프로젝트의 `.agents/references/credential-and-local-config.md`로 복사하고 루트 `AGENTS.md`가 이 참조를 연결하도록 합니다. 기존 local reference는 덮어쓰지 않습니다.
- 대상 프로젝트에 `AGENTS.local.md`가 없으면 `assets/templates/AGENTS.local.md`를 프로젝트 루트로 복사합니다. 이미 있으면 보존하고 필요한 섹션만 병합합니다. 비밀이 아닌 principal·project ID·credential 항목 라벨은 프로젝트 로컬 복사본의 맞는 위치에 설정하며 원본 template은 수정하지 않습니다. 값이 누락되면 저장소 설정을 먼저 확인하고 필요한 비밀 아닌 값만 사용자에게 대화로 요청합니다. 파일이 Git에서 추적되지 않고 무시되는지 `git ls-files -- AGENTS.local.md`, `git check-ignore -v AGENTS.local.md`로 확인합니다. 실제 secret 값, token, private key, 서비스 계정 JSON은 기록하지 않습니다. 개발용 API key·token은 `kp-credential`의 숨김 입력으로 OS 자격 증명 저장소에 넣고, 승인한 HTTPS origin·경로·method 범위에서만 `kp-credential request <항목이름> --url <HTTPS_URL>`로 사용합니다. 값은 채팅, 환경 변수, 명령 인수 또는 출력에 포함하지 않습니다.
- 앱/API Skill dependency 설치 때 `kp-credential` CLI가 사용자 환경에 준비되어 있어야 합니다. API credential이 필요하면 `kp-credential --version`과 명령 탐색을 확인하고 빠졌거나 낡았으면 공통 reference의 절차로 먼저 자동 설치·갱신합니다. 실제 값은 `kp-credential add <항목이름>`의 숨김 입력에서 직접 저장하며, 이 도구는 임의 명령의 환경 변수 주입이나 Firebase 배포 identity 관리를 대체하지 않습니다.
- 모든 작업은 branch/worktree 정책을 따르고 목적 맥락별로 커밋합니다. `main`/`dev` 직접 push는 작업 직전에 사용자의 승인을 받아야 합니다. base branch 직접 merge도 별도 승인을 받습니다. 커밋 전에 GitHub 인증 계정과 Git author/committer가 일치하는지 확인하고 repository 정책에 필요한 사전 승인을 받습니다.

## Project script 준비

도메인 `package.json`에 기존 구조와 일치하는 검증 script를 준비합니다. repository가 해당 환경·config·project ID·function export를 확정하지 못했다면 불완전하거나 추측한 script를 만들지 않습니다.

- unit test script는 실제 test runner와 기존 테스트 파일에 맞춥니다. 서로 다른 codebase가 사용하는 Mocha와 `node:test`를 하나로 임의 통일하지 않습니다.
- emulator가 필요한 integration test는 전용 `test:<domain>:emulator` 또는 repository naming convention에 맞는 script를 제공합니다. demo project ID를 명시하고 실제로 사용하는 Firebase service emulator를 모두 포함합니다. Functions emulator만 구동하면서 Firestore·Auth·Storage가 live로 연결되는 script를 만들지 않습니다.
- 실제 DEV/PRD 배포 script가 기존 project별 기준에 포함되면 `--project`, config 경로와 `--only functions:<정확한-export>`를 명시합니다. API 코드 검증이나 test deployment script가 DEV/PRD를 대상으로 하지 않도록 분리합니다.
- 테스트 전용 원격 script는 별도 Firebase test project, 전용 data/secret/service account, 권한과 allowlist가 확인된 경우에만 만듭니다. `test*Router` export 이름만으로 별도 project를 가정하지 않습니다.

예시는 repository에서 모든 값을 확인한 다음에만 구체 script로 바꿉니다.

~~~json
{
  "scripts": {
    "test": "<확인한 도메인 test 명령>",
    "test:<domain>:emulator": "<demo project ID와 필요한 emulator를 지정한 격리 명령>",
    "deploy:<domain>:dev": "firebase deploy --config <실제-config> --only functions:<정확한-router-export> --project <실제-DEV-project-ID>",
    "deploy:<domain>:prd": "firebase deploy --config <실제-config> --only functions:<정확한-router-export> --project <실제-PRD-project-ID>"
  }
}
~~~

현재 repository가 per-domain config를 쓰지 않거나 npm script 명명법이 다르면 기존 프로젝트 계약을 따릅니다. 생성 script는 실행하지 말고 project·target이 일치하는지 먼저 읽어 확인합니다.

## 테스트와 Skill 설치

- unit tests, lint, format check를 실행합니다. HTTP/API 연동은 [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)를 사용해 unit test 다음에 격리된 Local Emulator Suite 검증을 진행합니다. emulator가 없는 외부 service는 mock/stub 처리합니다.
- 격리된 전용 test Firebase project가 확인되지 않으면 test function을 원격 배포하지 않습니다. `test*Router`는 별도 GCP sandbox가 아닐 수 있으므로 먼저 [테스트 환경 참조](../kp-api-test-deploy/references/test-environments.md)를 확인합니다.
- 초기화 종료 전에 [프로젝트 로컬 설치 지침](references/plugin-skills.md)을 읽고 기존 API Skill과 사용자 수정을 보존하면서 `kp-api-init`을 제외한 이 플러그인의 누락된 여섯 Skill만 설치합니다. `kp-app-skill`은 설치하지 않습니다. `--global`/`-g`를 쓰지 않습니다. 설치 후 추가한 API Skill과 실제 프로젝트·에이전트 경로를 사용자에게 알립니다.
- 초기화는 실제 DEV·PRD 배포를 포함하지 않습니다. 사용자가 환경·함수 범위를 명시해 배포를 요청했을 때만 `kp-api-test-deploy` 결과를 먼저 확인한 뒤 `kp-api-deploy`를 사용합니다.

## 종료 보고

추가한 codebase·router, npm scripts, 확인한 환경 ID의 종류, 테스트·lint 결과, unresolved IAM 요구와 다음 단계를 보고합니다. 비밀값을 출력하지 않습니다. emulator 결과는 cloud 배포나 live API 확인과 구분합니다.

## 참고

- repository architecture, 공통 middleware, codebase별 변이와 Center 공개 범위: [API 저장소 패턴 분석](references/api-project-architecture.md)
- test emulator와 전용 test project 기준: [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)
- DEV/PRD Functions 배포 절차: [`kp-api-deploy`](../kp-api-deploy/SKILL.md)
- API 문서화와 만료형 preview: [`kp-api-docs`](../kp-api-docs/SKILL.md)
- 생성 저장소 지침과 계정 템플릿: [AGENTS.md](assets/templates/AGENTS.md), [AGENTS.local.md](assets/templates/AGENTS.local.md), [.agents/references/cloud-access.md](assets/templates/.agents/references/cloud-access.md), 설치된 manager의 `kp-skill-install/references/credential-and-local-config.md`
- 프로젝트 전체 Skill 설치: [plugin-skills.md](references/plugin-skills.md)

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Firebase Functions | 새 HTTP router와 function export 계약을 확인합니다. | [Functions](https://firebase.google.com/docs/functions), [Functions API reference](https://firebase.google.com/docs/reference/functions) |
| API | KP 인증 | 기존 repository 구현과 환경별 API 문서를 대조합니다. 초기화 중 외부 API를 호출하거나 DEV·PRD에 배포하지 않습니다. | [DEV Developer Center](https://developer-kpcenter-dev.web.app/api/), [PRD Developer Center](https://developer-kpcenter.web.app/api/) |
| CLI | Git | `git status --short --branch`와 `git check-ignore -v AGENTS.local.md`로 상태와 ignore 여부를 확인합니다. | [git status](https://git-scm.com/docs/git-status), [git check-ignore](https://git-scm.com/docs/git-check-ignore) |
| CLI | Package manager | lockfile에서 manager를 확인하고 기존 script를 `<PACKAGE_MANAGER> run <SCRIPT_NAME>`으로 실행합니다. | [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | emulator script는 `firebase emulators:exec --config <FIREBASE_CONFIG> --project demo-<TEST_PROJECT_ID> --only <EMULATOR_LIST> "<TEST_COMMAND>"` 형식으로 구성합니다. 배포 scripts는 실행하지 않습니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [emulator 설정](https://firebase.google.com/docs/emulator-suite/install_and_configure) |
| 기타 | Node.js·test runner·lint·format·emulator | 프로젝트 설정을 확인하며, HTTP integration test는 필요하면 `kp-api-test-deploy`의 Local Emulator Suite로 수행합니다. | — |
