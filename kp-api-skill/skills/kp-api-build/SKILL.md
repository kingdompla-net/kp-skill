---
name: kp-api-build
description: "KP API 도메인 기능을 요청받아 codebase·router 준비, endpoint·필요 worker 구현과 검증을 조합할 때 사용합니다."
metadata:
  version: "1.0.1"
---

# KP API 구축

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

API 기능 요청의 진입점입니다. 기존 저장소를 먼저 읽어 현재 구조와 권한 경계를 확인하고, codebase·router·endpoint·worker 중 요청에 필요한 부분만 구현합니다. 모든 일을 항상 init·endpoint·worker로 나누거나 불필요한 worker를 추가하지 않습니다.

## 선택 흐름

1. 저장소의 `AGENTS.md`, 필요한 경우 `AGENTS.local.md`, branch, 작업 트리, Firebase config, codebase exports, router, endpoint·worker·테스트와 npm scripts를 확인합니다.
2. 새 도메인의 codebase/router가 없으면 [`kp-api-init`](../kp-api-init/SKILL.md)의 절차를 따릅니다. 이미 존재하면 초기화를 반복하지 않습니다.
3. 요청 기능이 짧은 HTTP 응답으로 끝나면 [`kp-api-endpoint`](../kp-api-endpoint/SKILL.md)로 기존 router를 확장합니다.
4. 요청 시간 제한, 지연 실행, 독립 retry, schedule, 장기 처리 중 실제 요구가 있을 때만 [`kp-api-worker`](../kp-api-worker/SKILL.md)를 함께 적용합니다. worker가 필요하지 않은 경우 이유도 확인합니다.
5. route contract, schema, auth·권한, side effect, retry와 test strategy를 구현 전에 확인합니다. 확인할 수 없는 정보만 요청하고 endpoint나 IAM role을 추측하지 않습니다.
6. unit test와 lint·format을 실행하고, 실제 API 의존성이 있는 경우 [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)로 격리된 emulator 검증을 추가합니다. 실제 cloud deploy나 외부 부작용을 코드 검증에 섞지 않습니다.
7. 사용자가 DEV 또는 PRD 배포를 명시해 요청한 경우에만 [`kp-api-deploy`](../kp-api-deploy/SKILL.md)를 따릅니다. 배포 후 실제 배포된 공개 API가 있으면 [`kp-api-docs`](../kp-api-docs/SKILL.md)를 사용해 Center 문서를 준비합니다. 배포 요청이 없으면 배포하지 않습니다.

## 종료 조건

요청한 HTTP contract가 구현되고 관련 테스트가 통과했으며, 필요한 worker가 있을 때만 구현·검증되고, 배포를 요청하지 않았다면 source-only 결과를 provider 상태와 구분해 보고했을 때 완료입니다. 계정·권한이 막히면 실제 차단 주체·프로젝트·permission과 관리자에게 요청할 항목을 제시합니다. 권한을 임의로 넓히거나 부여하지 않습니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Firebase Functions | 기본 작업에서는 live API를 호출하지 않습니다. Functions contract(계약)은 문서와 대상 codebase에서 확인합니다. | [Functions](https://firebase.google.com/docs/functions) |
| API | Handler가 사용하는 외부 API | 정확한 service와 endpoint를 대상 저장소에서 식별하고 해당 API 계약을 확인합니다. 검증에는 emulator 또는 mock을 사용합니다. | 실제 endpoint를 식별한 뒤 해당 service의 공식 문서를 연결합니다. |
| CLI | Git | 저장소 상태를 `git status --short --branch`로 확인합니다. | [git status](https://git-scm.com/docs/git-status) |
| CLI | Package manager | lockfile과 `package.json`에서 script를 확인하고 `npm run <SCRIPT_NAME>`, `pnpm run <SCRIPT_NAME>`, `yarn <SCRIPT_NAME>` 또는 `bun run <SCRIPT_NAME>`으로 test·lint·format을 실행합니다. | [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | emulator 검증을 별도 수행할 때 `firebase emulators:exec --config <FIREBASE_CONFIG> --project demo-<TEST_PROJECT_ID> --only <EMULATOR_LIST> "<TEST_COMMAND>"`를 실행합니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [emulator 설정](https://firebase.google.com/docs/emulator-suite/install_and_configure) |
| 기타 | Runtime·test runner·lint·format·emulator | 대상 codebase의 `package.json`과 설정을 확인합니다. 필요하면 `kp-api-test-deploy`의 Firebase Local Emulator Suite를 사용합니다. | — |
