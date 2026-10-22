---
name: kp-app-deploy-prd
description: "초기화된 KP React 앱의 Firebase Hosting PRD 배포를 요청받았을 때 사용합니다. production 빌드 후 live 배포 전에 대상과 승인을 확인합니다."
metadata:
  version: "1.0.0"
---

# KP 앱 PRD 배포

요청된 초기화 KP 앱의 PRD Hosting 배포를 준비합니다. 별도 지시가 없으면 먼저 검증과 production 빌드까지만 수행하고, 사용자가 실제 배포를 명시적으로 승인한 뒤에만 live 배포합니다.

## 수행 절차

1. 현재 저장소의 `AGENTS.md`, `AGENTS.local.md`, 브랜치와 `git status --short --branch`를 확인합니다. 관련 없는 미커밋 변경이 배포 산출물에 들어갈 수 있으면 먼저 범위를 확인합니다.
2. 이 Skill과 함께 설치된 `../kp-app-deploy/SKILL.md`, `../kp-app-deploy/references/access-and-secrets.md`, `../kp-app-deploy/references/firebase-hosting.md`를 읽고 공통 계정·배포 규칙을 적용합니다. 필요한 참조나 `kp-skill-manager`가 설치되어 있지 않으면 필요한 이유와 프로젝트 로컬 설치 경로를 설명하고 동의를 구합니다.
3. 대상 `package.json`, `firebase.json`, `.firebaserc`에서 `build:prd`, `deploy:prd`, PRD Firebase 프로젝트 ID, `hosting:prd` 연결 대상 사이트 ID와 도메인을 확인합니다. DEV 프로젝트·사이트 설정을 대신 사용하거나 값을 추측하지 않습니다.
4. PRD 빌드와 저장소가 요구하는 검사를 실행합니다. 실패하거나 설정이 서로 맞지 않으면 배포하지 않고 문제를 보고합니다.
5. 빌드가 통과하면 대상 프로젝트 ID·Hosting 사이트 ID·도메인·검사 및 빌드 결과를 요약하고 사용자가 실제 PRD 배포를 승인하는지 묻습니다. 승인 전에는 `deploy:prd`나 `firebase deploy`를 실행하지 않습니다.
6. 사용자가 현재 대상에 대한 배포를 승인하면 `deploy:prd`를 실행합니다. 사용자가 현재 요청에서 승인 확인 없이 바로 PRD에 배포하라고 명시한 경우에는 빌드와 설정 검증이 통과한 뒤 진행할 수 있습니다.
7. 성공하면 CLI 결과와 PRD 도메인의 HTTP 응답을 확인합니다.

## 검증과 보고

- 배포는 `--only hosting:prd`와 실제 PRD Firebase 프로젝트 ID로 범위를 제한합니다. Functions, Firestore, Storage 등 다른 제품을 함께 배포하지 않습니다.
- 저장소·브랜치·작업 트리 상태, 검사와 빌드 결과, Firebase 프로젝트·Hosting 타깃, 승인 여부, CLI 결과와 HTTP 상태를 구분해 보고합니다.
- 승인받지 않은 경우에는 production build 완료와 실제 배포 대기 상태를 명확히 알립니다.

## 관련 Skill

- 공통 Firebase 배포 절차와 계정 검증은 [`kp-app-deploy`](../kp-app-deploy/SKILL.md)를 따릅니다.
- DEV 배포 요청은 [`kp-app-deploy-dev`](../kp-app-deploy-dev/SKILL.md)로 연결합니다.
- 이 Skill을 프로젝트 로컬로 사용할 때는 같은 에이전트 경로에 `kp-skill-manager` Skill 전체가 있어야 합니다. 없으면 먼저 설치 동의를 받습니다.
