---
name: kp-app-deploy
description: "초기화된 KP React 앱을 사용자가 지정한 DEV 또는 PRD Firebase Hosting 환경에 사전 검증하고 배포할 때 사용한다."
metadata:
  version: "2.4.0"
---

# KP 앱 Firebase Hosting 배포

초기화된 KP 앱을 확인된 Firebase Hosting 환경에 배포한다. DEV와 PRD를 모두 지원하며, 실제 배포는 사용자가 환경을 지정해 명시적으로 요청한 경우에만 수행한다. 환경이 지정되지 않으면 어느 환경에도 배포하지 말고 대상 환경을 묻는다.

## 배포 절차

1. 대상 저장소 루트, 적용되는 `AGENTS.md`, `AGENTS.local.md`, 현재 브랜치와 `git status --short --branch`를 확인한다. 계정·브랜치·배포 규칙을 먼저 따른다. 관련 없는 미커밋 변경이 배포 산출물에 들어갈 수 있으면 범위를 정리하기 전 배포하지 않는다.
2. 요청된 환경과 대상 저장소의 `package.json`, `firebase.json`, `.firebaserc`를 대조한다. DEV는 `build:dev`와 `deploy:dev`, PRD는 `build:prd`와 `deploy:prd`를 사용한다. 환경별 Firebase 프로젝트 ID, Hosting 논리 타깃, 연결된 Hosting 사이트 ID, 배포 도메인이 확인되어야 한다. 앱 ID나 Hosting 사이트 ID를 다른 저장소에서 복사하거나 추측하지 않는다.
3. Firebase CLI에서 현재 인증 계정을 확인하고 `AGENTS.local.md`에 지정된 해당 환경 계정과 일치하는지 확인한다. 계정이나 프로젝트 접근 권한을 확인할 수 없으면 중단한다.
4. [references/firebase-hosting.md](references/firebase-hosting.md)를 읽고 선택 환경의 빌드·배포 명령과 Hosting 전용 배포 범위를 검증한다. `firebase deploy`만 단독 실행하지 않는다.
5. 요청 환경의 빌드 스크립트와 관련 검사를 실행한다. 배포 스크립트가 이미 같은 빌드를 다시 실행한다면 불필요하게 중복 빌드하지 않는다. 빌드가 실패하거나 실제 프로젝트·타깃·사이트 연결이 모호하면 배포하지 않는다. DEV와 PRD의 스크립트·mode·프로젝트·사이트를 서로 바꾸어 사용하지 않는다.
6. 사용자 요청과 일치하는 환경에만 배포한다. 배포가 성공하면 CLI 결과와 프로젝트·타깃을 확인하고, 설정된 도메인의 HTTP 응답을 점검한다. 화면 동작까지 확인해야 하면 프로젝트의 브라우저 규칙에 따라 Aside로 확인한다.

## 보고

소스 브랜치와 커밋, 배포 전 작업 트리 상태, 빌드·검사 결과, Firebase 프로젝트와 Hosting 타깃, CLI 배포 결과, 배포 후 HTTP 상태를 구분해 보고한다. 브라우저에서 보지 않은 화면은 시각 검증했다고 말하지 않는다. 이 스킬은 배포만 담당하며 커밋, push, PR 생성·병합은 대상 저장소의 `AGENTS.md`와 참조 규칙을 따른다.
