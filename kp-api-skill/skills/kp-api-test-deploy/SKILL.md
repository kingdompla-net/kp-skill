---
name: kp-api-test-deploy
description: "KP API 기능을 DEV·PRD와 분리된 로컬 emulator 또는 승인된 전용 테스트 Firebase project에서 검증할 때 사용합니다."
metadata:
  version: "1.0.0"
---

# KP API 테스트 환경 실행

실제 DEV·PRD Functions를 변경하지 않고 API와 worker를 검증합니다. 기본 경로는 unit test와 Firebase Local Emulator Suite입니다. 이 Skill에서 `test deploy`라고 부르는 원격 배포는 전용 테스트 Firebase project가 확인된 경우에만 수행합니다.

## 시작 전 확인

1. 저장소의 `AGENTS.md`, 필요한 경우 `AGENTS.local.md`, 현재 branch와 작업 트리, `firebase.json`, `.firebaserc`, Functions codebase, 테스트 명령과 외부 부작용을 확인합니다.
2. [테스트 환경 참조](references/test-environments.md)를 읽습니다. root `firebase.json`의 emulator 설정과 Functions가 사용하는 Firestore, Auth, Storage, Messaging, Pub/Sub, Cloud Tasks, 외부 서비스 중 무엇이 실제로 emulator에 연결되는지 확인합니다.
3. Emulator Suite 테스트는 `demo-` 접두사의 project ID를 사용합니다. `dev`, `prd`, 실제 project alias나 실사용 credential이 테스트 프로세스에 전달되지 않도록 확인합니다.
4. Firebase 제품 emulator를 실행하지 않는 상태에서 Admin SDK 호출이 실제 Firebase project로 갈 수 있는지 확인합니다. 관련 emulator가 없거나 외부 연동을 확실하게 차단할 수 없으면 테스트를 시작하지 말고 mock/stub 경로를 사용합니다.

## 기본 검증: 로컬 emulator

- 먼저 codebase에 있는 unit test와 lint를 실행합니다. 테스트 runner는 `package.json`과 현재 테스트 파일에서 확인하고 Mocha, `node:test` 등을 임의로 바꾸지 않습니다.
- HTTP `onRequest`, callable, Cloud Tasks와 지원되는 background trigger는 Firebase emulator로 실행할 수 있습니다. `emulators:exec`를 사용해 테스트 프로세스 실행과 emulator 종료를 한 작업 안에서 관리합니다.
- Firestore, Auth, Storage 등 handler가 쓰는 각 Firebase 서비스 emulator를 함께 시작합니다. Functions emulator만 단독으로 실행했을 때 다른 SDK 요청이 실서비스로 연결될 수 있음을 전제로 합니다.
- project ID를 `demo-<식별자>`로 고정하고, SDK 초기화 ID와 CLI project ID가 같은지 확인합니다. 테스트 중 emulator host가 loopback 주소인지 검증합니다.
- emulator가 지원하지 않는 IAM, 실제 서비스 계정 권한, Cloud Tasks dispatch의 운영 특성, 외부 API는 mock 또는 독립적인 승인된 테스트 harness로 검증합니다. emulator에서 확인되지 않은 운영 동작을 통과했다고 보고하지 않습니다.
- 실제 결제, 이메일·SMS·push 발송, 삭제, 사용자 데이터 변경, 운영 queue enqueue, 실외부 AI·번역·미디어 호출은 하지 않습니다.

## 원격 테스트 project 배포

사용자가 원격 test deployment를 명시적으로 요청했고 별도 project가 구성된 경우에만 진행합니다.

1. `AGENTS.local.md`에 등록된 test project ID, 테스트 전용 Firebase Auth/Firestore/Storage, Secret Manager 참조, deploy principal과 허용 함수 범위를 확인합니다. `.firebaserc` alias가 `test`라는 이름이라는 사실만으로 격리를 단정하지 않습니다.
2. test project ID가 DEV·PRD와 다르고 해당 환경의 데이터·secret·service account·queue·외부 endpoint가 분리됐는지 확인합니다. 격리 증거가 부족하면 원격 배포를 중단하고 로컬 emulator로 전환합니다.
3. 환경과 target을 `--project <검증한-test-project-id>`, `--config <확인한-config>`, `--only functions:<정확한-function-export>`로 고정합니다. deploy script를 쓴다면 실제 project, config, function 범위가 일치하는지 script 내용을 먼저 확인합니다.
4. 함수 export, secret binding, invoker, IAM, runtime service account, queue·schedule 변경을 사용자에게 보이는 diff와 함께 확인합니다. 예상 밖 권한 변경, 삭제, live dependency가 있으면 배포를 진행하지 않습니다.
5. CLI가 제시한 대상이 전용 test project와 정확한 함수만인지 마지막으로 확인한 뒤 실행합니다. 배포 후 project ID와 함수 이름, URL, 검사 결과를 기록합니다. 실제 사용자 데이터나 운영 API 호출은 하지 않습니다.

## 기존 `test*Router` export 주의

`kingdom-planet-api-fb`의 `test*Router`는 로컬 emulator가 아닙니다. 각 export는 Cloud Functions의 별도 배포 가능한 HTTPS 함수입니다. 현재 구현은 Firestore의 `kp-test-db`와 `kp-test-api-db`, `test_api_key`를 사용하지만 app 설정을 control DB에서 읽고, Firebase Auth·Storage·Messaging client는 같은 project를 사용합니다. 별도 test Firebase project가 확인되지 않았으므로 이런 route를 완전 격리된 원격 test environment로 간주하지 않습니다.

## 종료 보고

검증한 codebase, unit/emulator/원격 test 구분, 사용한 project 종류, emulator 서비스 목록, 함수 범위, 실행 명령과 결과를 보고합니다. 로컬 emulator 통과를 DEV·PRD 배포 완료 또는 production parity로 표현하지 않습니다. test project가 준비되지 않았거나 IAM 권한이 없으면 실제 오류와 차단 범위를 설명합니다.

## 참고 자료

- 저장소 구조와 현재 test export 범위: [API 저장소 패턴](../kp-api-init/references/api-project-architecture.md)
- emulator 및 demo project 경계: [테스트 환경 참조](references/test-environments.md)
- DEV·PRD 배포 요청이 별도로 승인된 경우: [`kp-api-deploy`](../kp-api-deploy/SKILL.md)

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Functions·Auth·Firestore·Storage·Messaging·Pub/Sub·Cloud Tasks | 설정된 emulator가 지원하는 service만 검증합니다. 외부 API는 mock/stub으로 대체하고 DEV·PRD에 연결하지 않습니다. | [Functions](https://firebase.google.com/docs/functions), [Firebase Auth](https://firebase.google.com/docs/auth), [Firestore](https://firebase.google.com/docs/firestore), [Storage](https://firebase.google.com/docs/storage), [Messaging](https://firebase.google.com/docs/cloud-messaging), [Pub/Sub](https://cloud.google.com/pubsub/docs/reference/rest), [Cloud Tasks](https://cloud.google.com/tasks/docs/reference/rest) |
| CLI | Firebase CLI: emulator | `firebase emulators:exec --config <FIREBASE_CONFIG> --project demo-<TEST_PROJECT_ID> --only <EMULATOR_LIST> "<TEST_COMMAND>"`를 실행합니다. emulator 목록은 handler와 `firebase.json`에서 선택합니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [emulator 설정](https://firebase.google.com/docs/emulator-suite/install_and_configure) |
| CLI | Package manager | lockfile에서 manager를 확인한 뒤 `<PACKAGE_MANAGER> run <TEST_SCRIPT>` 및 `<PACKAGE_MANAGER> run <LINT_SCRIPT>` 형식으로 실행합니다. | [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI: 원격 test deploy | 전용 test project가 확인되고 요청된 경우에만 `firebase deploy --config <CONFIG_PATH> --only functions:<FUNCTION_EXPORT> --project <TEST_PROJECT_ID>`를 실행합니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [Functions 배포](https://firebase.google.com/docs/functions/manage-functions) |
| 기타 | Local Emulator Suite·test runner·mock/stub | emulator 미지원 동작은 별도 승인된 test harness로 구분합니다. | [Emulator Suite](https://firebase.google.com/docs/emulator-suite) |

## KP Skill 관계와 관리자 설치

- 이 Skill을 프로젝트에서 사용할 때는 동일한 프로젝트·에이전트 경로에 `kp-skill-manager`의 세 Skill이 있는지 확인합니다. 없으면 manager의 역할과 필요한 설치 경로를 설명하고 설치 동의를 받은 뒤에만 manager 전체를 프로젝트 로컬로 설치합니다. 거부하면 KP Skill 작업을 진행하지 않습니다. 사용자가 manager 설치를 직접 요청한 경우는 설치 동의로 봅니다.
- 다른 KP Skill이 필요해지면 아래 정본 문서 또는 현재 에이전트의 `.agents/skills/kp-skill-install/references/`나 `.claude/skills/kp-skill-install/references/`에 있는 관계표를 읽습니다. 필요한 Skill이 없으면 이유와 이름을 알리고 추가 설치 동의를 구합니다. 동의한 Skill만 설치하며 관계표의 모든 Skill을 무조건 실행하지 않습니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-api-test-deploy/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-api-test-deploy/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 manager 선행 조건은 [플러그인 안내](../../README.ko.md)를 확인합니다.
- 정본 관계표: `kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md`.
