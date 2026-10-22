---
name: kp-app-deploy-dev
description: "초기화된 KP React 앱을 요청된 Firebase Hosting DEV 환경에 검증·빌드·배포할 때 사용합니다. PRD 배포에는 사용하지 않습니다."
metadata:
  version: "1.0.0"
---

# KP 앱 DEV 배포

요청된 초기화 KP 앱을 DEV Firebase Hosting에 배포합니다. 이 Skill은 DEV만 대상으로 합니다.

## 수행 절차

1. 현재 저장소의 `AGENTS.md`, `AGENTS.local.md`, 브랜치와 `git status --short --branch`를 확인합니다. 관련 없는 미커밋 변경이 배포 산출물에 들어갈 수 있으면 먼저 범위를 확인합니다.
2. 이 Skill과 함께 설치된 `../kp-app-deploy/SKILL.md`, `../kp-app-deploy/references/access-and-secrets.md`, `../kp-app-deploy/references/firebase-hosting.md`를 읽고 공통 계정·배포 규칙을 적용합니다. 필요한 참조나 `kp-skill-manager`가 설치되어 있지 않으면 필요한 이유와 프로젝트 로컬 설치 경로를 설명하고 동의를 구합니다.
3. 대상 `package.json`, `firebase.json`, `.firebaserc`에서 `build:dev`, `deploy:dev`, Firebase 프로젝트 ID, `hosting:dev` 연결 대상 사이트 ID와 도메인을 확인합니다. 값을 추측하거나 다른 저장소에서 복사하지 않습니다.
4. DEV 빌드와 저장소가 요구하는 검사를 실행합니다. 실패하거나 설정이 서로 맞지 않으면 배포하지 않고 문제를 보고합니다.
5. 검증이 통과한 경우 `deploy:dev`를 실행하고 CLI 결과와 DEV 도메인의 HTTP 응답을 확인합니다. `firebase deploy` 단독 명령은 사용하지 않습니다.

## 검증과 보고

- Firebase 배포는 DEV Hosting으로만 제한하고 실제 프로젝트 ID를 명시합니다.
- 저장소·브랜치·작업 트리 상태, 검사와 빌드 결과, Firebase 프로젝트·Hosting 타깃, CLI 결과와 HTTP 상태를 구분해 보고합니다.
- 브라우저에서 확인하지 않은 화면을 시각 검증했다고 말하지 않습니다.

## 관련 Skill

- 공통 Firebase 배포 절차와 계정 검증은 [`kp-app-deploy`](../kp-app-deploy/SKILL.md)를 따릅니다.
- PRD 배포 요청은 [`kp-app-deploy-prd`](../kp-app-deploy-prd/SKILL.md)로 연결합니다.
- 이 Skill을 프로젝트 로컬로 사용할 때는 같은 에이전트 경로에 `kp-skill-manager` Skill 전체가 있어야 합니다. 없으면 먼저 설치 동의를 받습니다.
