---
name: kp-api-endpoint
description: "기존 KP Firebase Functions codebase와 router에 동기 HTTP endpoint를 추가하거나 수정할 때 사용합니다."
metadata:
  version: "1.0.1"
---

# KP API endpoint 구현

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

사용자가 요청한 동기 HTTP endpoint를 기존 API 구조에 추가하거나 수정합니다. 새 codebase가 필요한 요청은 `kp-api-init`, 비동기·예약 실행이 필요한 작업은 `kp-api-worker`, 여러 API를 끝까지 만드는 요청은 `kp-api-build`에서 처리합니다.

## 작업 절차

1. 저장소의 `AGENTS.md`, 필요한 경우 `AGENTS.local.md`, 현재 codebase, Firebase config, route exports, 테스트와 `git status --short --branch`를 확인합니다.
2. [`kp-api-init` 저장소 분석](../kp-api-init/references/api-project-architecture.md)을 읽고 기존 API contract, auth middleware, error envelope, schema validator와 log convention을 조사합니다. 현재 API 문서가 필요하면 승인된 source를 확인합니다.
3. method, path, 인증 주체, 호출자 권한, request schema, response schema, 오류, pagination과 부작용을 정리합니다. 필요한 필드나 권한을 추측하지 않습니다. KP 사용자, API key를 쓰는 backend, public request를 구분합니다.
4. 기존 도메인 router에 요청 경로를 등록합니다. 있는 middleware와 schema를 재사용하고 사업 로직 전에 요청을 검증합니다. 새 router/export가 필요하다면 별도 배포 또는 IAM 경계가 필요한 이유를 확인합니다.
5. handler의 입력과 외부 의존성을 명확히 하고, public response에서 raw exception, token, 개인정보를 제거합니다. 서버 API key를 browser나 client에 전달하지 않습니다.
6. 정상 경로, 인증·권한 거부, 잘못된 body, 외부 실패, 중복 또는 재시도 위험을 검증하는 unit test를 작성하거나 갱신합니다. 실제 결제·발송·삭제·대량 변경 API를 test에서 호출하지 않습니다.
7. 해당 codebase의 lint·format check·unit test를 실행하고 필요한 경우 [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)로 emulator test를 추가합니다. 이 Skill 자체는 DEV·PRD 배포를 포함하지 않습니다. 사용자가 환경을 지정해 배포를 요청한 경우 `kp-api-deploy`를 사용합니다.

## 완료 보고

추가한 route와 인증·schema 결정, 테스트 결과, 미확인 외부 contract를 보고합니다. local test를 provider 배포나 live response로 표현하지 않습니다. 운영 key, 사용자 token, secret을 로그나 결과에 출력하지 않습니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Firebase Functions HTTP handler | HTTP handler의 request·response 계약을 구현하며 live endpoint는 호출하지 않습니다. | [HTTP events](https://firebase.google.com/docs/functions/http-events), [Functions API reference](https://firebase.google.com/docs/reference/functions) |
| API | KP 인증 및 downstream API | 해당 endpoint의 계약을 기존 codebase 및 환경별 Developer Center 문서에서 확인합니다. | [DEV Developer Center](https://developer-kpcenter-dev.web.app/api/), [PRD Developer Center](https://developer-kpcenter.web.app/api/) |
| CLI | Git·package manager | `git status --short --branch`로 상태를 확인하고 lockfile에서 확인한 manager의 `<PACKAGE_MANAGER> run <SCRIPT_NAME>`으로 lint·format·unit test를 실행합니다. | [git status](https://git-scm.com/docs/git-status), [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | emulator가 필요하면 `kp-api-test-deploy`의 `firebase emulators:exec` 명령을 따릅니다. 이 Skill에서는 deploy하지 않습니다. | [Firebase CLI](https://firebase.google.com/docs/cli) |
| 기타 | Runtime·schema validation·test runner·mock | 대상 codebase의 기존 설정과 의존성을 확인해 사용합니다. | — |
