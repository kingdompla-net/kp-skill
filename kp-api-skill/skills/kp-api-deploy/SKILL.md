---
name: kp-api-deploy
description: "사용자가 환경을 지정해 요청한 KP Firebase Functions codebase 또는 함수를 사전 검증하고 좁은 범위로 배포할 때 사용합니다."
metadata:
  version: "1.0.1"
---

# KP API Firebase Functions 배포

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

DEV 또는 PRD에 사용자가 명시적으로 배포를 요청한 경우에만 해당 Firebase Functions를 배포합니다. PRD credential을 개발·테스트 세션에 노출하지 않고, 쓰기 권한을 agent가 스스로 추가하거나 넓히지 않습니다. 배포 전에 [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)의 격리 검증 결과를 확인합니다.

## 사전 확인

1. 저장소 루트, `AGENTS.md`, 필요한 경우 `AGENTS.local.md`, 현재 branch, `git status --short --branch`, 검토할 commit과 배포 파일을 확인합니다. 관련 없는 수정이 배포 source에 포함되면 범위를 확정할 때까지 멈춥니다.
2. [references/access-and-secrets.md](references/access-and-secrets.md)를 읽습니다. deploy command의 인증 주체, Firebase project ID, config 파일, codebase/function 이름과 region을 교차 확인합니다. `gcloud` active account만으로 Firebase CLI의 배포 주체를 단정하지 않습니다.
3. 사용자가 지정한 환경이 DEV인지 PRD인지, 배포할 router/export 또는 codebase가 무엇인지 확인합니다. API feature 구현만 요청한 경우에는 배포하지 않습니다. 환경이나 범위가 불명확하면 필요한 정보만 요청합니다.
4. `firebase.json` 또는 지정 config, `.firebaserc`, 해당 `package.json` scripts, predeploy command와 Firebase CLI 버전을 확인합니다. `--project <실제 project ID>`와 config 경로를 명시하고 alias나 현재 active project만 믿지 않습니다.
5. [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)의 결과를 확인한 뒤 선택된 codebase의 lint, format check, unit test와 필요한 emulator test를 통과시킵니다. 인증·invoker 정책, `secrets` binding, runtime service account, region, timeout, retry, queue 또는 schedule 변경도 diff에서 검토합니다.
6. `--only functions:<function-name>`으로 요청된 export만 선택합니다. 사용자가 codebase 전체를 지정했거나 최초 배포처럼 필요성이 확인된 경우에만 `--only functions:<codebase>`를 씁니다. 여러 config가 있으면 `--config`로 대상을 명시하고 Firebase CLI의 실제 선택 범위를 확인합니다.
7. 함수 삭제, 호출자 공개 범위 추가, Secret Manager 값 변경, queue IAM 변경, runtime service account 교체, PRD route 동작 변경을 발견하면 사용자가 명시적으로 요청하지 않은 한 배포를 중단하고 영향과 구체 대상을 설명합니다.

## 배포

검증된 codebase `package.json`에 환경별 npm script가 있으면 우선 사용합니다. 실행 전에 script가 요청된 환경, `--project`, `--config`, `--only`와 일치하는지 확인합니다. script가 없으면 같은 값으로 구성된 좁은 Firebase CLI command를 사용합니다. 아래는 예시이므로 대상 저장소에서 확인한 이름과 경로로 바꿉니다.

~~~sh
firebase deploy --config <CONFIG_PATH> --only functions:<FUNCTION_EXPORT> --project <FIREBASE_PROJECT_ID>
~~~

Firebase CLI가 예상하지 못한 service, function, IAM policy, queue, secret 또는 삭제를 제안하면 자동 승인하지 말고 중단합니다. 권한 오류가 나면 로컬 IAM policy를 임의 변경하지 않습니다. 실제 principal, target project/resource, denied permission과 실행하려던 operation을 추려 관리자에게 전달할 최소 권한 요청을 작성합니다.

배포 완료 후 CLI 출력의 project와 function target, 선택한 함수의 배포 상태를 확인합니다. 사용자가 실제 HTTP 결과 검증도 요청했거나 무해한 조회임이 명백한 경우에만 endpoint를 호출합니다. worker 실행, 외부 발송, 결제, 삭제와 데이터 변경은 임의로 트리거하지 않습니다.

실제로 배포된 공개 API가 있으면 [`kp-api-docs`](../kp-api-docs/SKILL.md)로 Center 문서 변경을 준비합니다. 내부 worker나 server-to-server 운영 endpoint는 public API Docs에 자동으로 추가하지 않습니다.

## 보고

source branch/commit, 검사 결과, 인증 principal, Firebase project, config/codebase/function 범위, CLI 결과와 배포 후 상태를 구분해 보고합니다. 배포 실패, 권한 부족, 예상하지 못한 IAM 변경은 성공으로 표시하지 않습니다. secret 값, access token, ADC 파일 내용은 출력하지 않습니다.

## 참고

- 권한 제공 harness, 계정과 ADC 경계, secret storage, IAM 관리자 요청: [access-and-secrets.md](references/access-and-secrets.md)
- codebase/함수 단위 `--only` 배포와 QT 관찰 범위: [`kp-api-init` 구조 레퍼런스](../kp-api-init/references/api-project-architecture.md)
- Firebase 공식 문서: [Functions 배포·관리](https://firebase.google.com/docs/functions/manage-functions), [Functions codebase 구성](https://firebase.google.com/docs/functions/organize-functions), [Firebase IAM 권한](https://firebase.google.com/docs/projects/iam/permissions)

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Firebase Functions | 배포 절차와 대상 export를 확인합니다. HTTP endpoint는 요청 또는 무해한 조회로 확인된 경우에만 호출합니다. | [Functions 배포](https://firebase.google.com/docs/functions/manage-functions) |
| API | IAM·Secret Manager·queue·schedule | 실제 배포 설정에 포함된 권한, secret binding, queue 및 schedule contract(계약)를 확인합니다. | [IAM](https://cloud.google.com/iam/docs), [Secret Manager](https://cloud.google.com/secret-manager/docs), [Cloud Tasks API](https://cloud.google.com/tasks/docs/reference/rest), [Cloud Scheduler API](https://cloud.google.com/scheduler/docs/reference/rest) |
| CLI | Git | 저장소 상태를 `git status --short --branch`로 확인합니다. | [git status](https://git-scm.com/docs/git-status) |
| CLI | Package manager | `package.json`에 검증된 배포 script가 있으면 `<PACKAGE_MANAGER> run <DEPLOY_SCRIPT>`로 실행합니다. | [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | 승인된 직접 배포는 `firebase deploy --config <CONFIG_PATH> --only functions:<FUNCTION_EXPORT> --project <FIREBASE_PROJECT_ID>`로 범위를 고정합니다. export와 project/config 값은 저장소 설정에서 확인합니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [Functions 배포](https://firebase.google.com/docs/functions/manage-functions) |
| 기타 | Firebase 설정·emulator·unit test | 배포 대상과 인증 주체를 대상 저장소 설정 및 emulator 결과와 대조합니다. | — |
