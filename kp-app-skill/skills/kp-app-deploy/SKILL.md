---
name: kp-app-deploy
description: "초기화된 KP React 앱을 Firebase Hosting에 배포할 때 사용합니다. 이 Skill의 기본 호출은 DEV이며, DEV·PRD 절차는 각각 별도 Skill로 선택할 수 있습니다."
metadata:
  version: "2.7.1"
---

# KP 앱 Firebase Hosting 배포

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

초기화된 KP 앱의 Firebase Hosting을 검증하고 요청된 환경에 배포합니다. 환경이 없는 기본 호출은 DEV 배포로 해석합니다. PRD 요청은 먼저 production 빌드까지 진행하고, 사용자가 현재 대상에 대한 실제 배포를 별도로 승인한 뒤에만 live 배포합니다.

## 기본 호출

`kp-app-deploy`를 환경 지정 없이 호출하면 DEV 배포로 처리합니다. DEV와 PRD 배포 절차는 각각 `kp-app-deploy-dev`와 `kp-app-deploy-prd` Skill로 분리되어 있습니다. 해당 Skill은 현재 프로젝트의 Skill 목록에서 선택하고, 설치되어 있지 않으면 설치 동의 규칙을 따릅니다.

PRD 실제 배포는 이 기본 Skill의 호출만으로 승인된 것으로 보지 않습니다. PRD 전용 Skill은 production 빌드 후 대상 프로젝트·Hosting 사이트·도메인·빌드 결과를 요약하고 live 배포 승인을 확인합니다. 사용자가 현재 요청에서 승인 확인 없이 PRD에 바로 배포하라고 명시한 경우에만 추가 질문 없이 진행할 수 있습니다.

## 배포 절차

1. 대상 저장소 루트, 적용되는 `AGENTS.md`, `AGENTS.local.md`, 현재 브랜치와 `git status --short --branch`를 확인합니다. 계정·브랜치·배포 규칙을 먼저 따릅니다. 관련 없는 미커밋 변경이 배포 산출물에 들어갈 수 있으면 범위를 정리하기 전에는 배포하지 않습니다.
2. 이 Skill은 DEV를 선택합니다. PRD 배포는 `kp-app-deploy-prd` Skill로 연결합니다. PRD와 DEV 요청이 함께 있거나 대상이 모호하면 빌드·배포 전에 확인합니다.
3. 대상 저장소의 `package.json`, `firebase.json`, `.firebaserc`에서 요청 환경의 `build:<env>`·`deploy:<env>`, Firebase 프로젝트 ID, Hosting 논리 타깃, 연결된 Hosting 사이트 ID와 배포 도메인을 대조합니다. 설정값을 다른 저장소에서 복사하거나 추측하지 않습니다.
4. [references/access-and-secrets.md](references/access-and-secrets.md)를 읽습니다. Firebase CLI 계정, gcloud CLI 계정, ADC 주체와 프로젝트 IAM 권한을 구분하고 `AGENTS.local.md`에 지정된 환경 주체와 일치하는지 확인합니다. 계정이나 권한을 확인할 수 없으면 중단하고 필요한 항목을 보고합니다.
5. [references/firebase-hosting.md](references/firebase-hosting.md)를 읽고 빌드·배포 명령과 Hosting 전용 범위를 검증합니다. `firebase deploy`만 단독 실행하지 않습니다. `--only hosting:<target>`와 실제 프로젝트 ID를 지정하는지 확인합니다.
6. 요청 환경의 build script와 관련 검사를 실행합니다. 빌드가 실패하거나 프로젝트·타깃·사이트 연결이 모호하면 배포하지 않습니다. DEV와 PRD의 스크립트·mode·프로젝트·사이트를 서로 바꾸어 사용하지 않습니다.
7. DEV는 검증과 빌드가 통과하면 `deploy:dev`를 실행합니다. PRD는 build 성공 뒤 사용자가 현재 환경에 대한 실제 배포를 별도로 승인했는지 확인합니다. 승인 전에는 어떤 PRD deploy command도 실행하지 않습니다. 사용자가 현재 요청에서 승인 질문 없이 곧장 PRD 배포하라고 명시한 경우에만 이 확인을 생략합니다. 승인 후 `deploy:prd`를 실행합니다.
8. 배포가 성공하면 CLI 결과와 Firebase 프로젝트·Hosting 타깃을 확인하고 설정된 도메인의 HTTP 응답을 점검합니다. 화면 동작까지 확인해야 하면 프로젝트의 브라우저 규칙에 따라 Aside로 확인합니다.

## 보고

소스 브랜치와 커밋, 배포 전 작업 트리 상태, 빌드·검사 결과, Firebase 프로젝트와 Hosting 타깃, PRD 배포 승인 여부, CLI 배포 결과, 배포 후 HTTP 상태를 구분해 보고합니다. PRD 배포 승인을 받지 않은 경우 build 완료와 배포 대기 상태를 명확히 알립니다. 브라우저에서 확인하지 않은 화면은 시각 검증했다고 말하지 않습니다. 이 Skill은 배포만 담당하며 커밋, push, PR 생성·병합은 대상 저장소의 `AGENTS.md`와 참조 규칙을 따릅니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Firebase Hosting·IAM | 배포는 Firebase CLI로 수행하며 Hosting REST API를 직접 호출하지 않습니다. 대상 도메인의 HTTP response는 read-only로 확인합니다. | [Firebase Hosting](https://firebase.google.com/docs/hosting), [Google Cloud IAM](https://cloud.google.com/iam/docs) |
| CLI | Git | 저장소 상태를 `git status --short --branch`로 확인합니다. | [git status](https://git-scm.com/docs/git-status) |
| CLI | Package manager | `package.json`의 실제 script를 확인하고 `<PACKAGE_MANAGER> run <BUILD_SCRIPT>` 및 `<PACKAGE_MANAGER> run <DEPLOY_SCRIPT>`를 실행합니다. | [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | 직접 배포가 승인된 경우 `firebase deploy --only hosting:<HOSTING_TARGET> --project <FIREBASE_PROJECT_ID>`로 Hosting만 배포합니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [Hosting 배포](https://firebase.google.com/docs/hosting) |
| 기타 | `package.json`·`firebase.json`·`.firebaserc`·build·검사 도구·브라우저 | 설정 파일로 target을 확인하고 화면 검증은 해당 저장소의 브라우저 절차를 따릅니다. | — |

## 배포 Skill 호출

- Claude Code에서 프로젝트 로컬 Skill을 직접 설치했다면 `/kp-app-deploy-dev` 또는 `/kp-app-deploy-prd`를 사용합니다. Claude Code 플러그인으로 설치했다면 `/kp-app-skill:kp-app-deploy-dev` 또는 `/kp-app-skill:kp-app-deploy-prd`를 사용합니다. Codex에서는 `$kp-app-deploy-dev` 또는 `$kp-app-deploy-prd` Skill을 선택합니다.
