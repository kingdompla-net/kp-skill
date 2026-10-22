---
name: kp-app-deploy
description: "초기화된 KP React 앱을 사용자가 지정한 DEV 또는 PRD Firebase Hosting 환경에 사전 검증하고 배포할 때 사용합니다."
metadata:
  version: "2.5.0"
---

# KP 앱 Firebase Hosting 배포

초기화된 KP 앱을 확인된 Firebase Hosting 환경에 배포한다. DEV와 PRD를 모두 지원하며, 실제 배포는 사용자가 환경을 지정해 명시적으로 요청한 경우에만 수행한다. 환경이 지정되지 않으면 어느 환경에도 배포하지 말고 대상 환경을 묻는다.

## 배포 절차

1. 대상 저장소 루트, 적용되는 `AGENTS.md`, `AGENTS.local.md`, 현재 브랜치와 `git status --short --branch`를 확인한다. 계정·브랜치·배포 규칙을 먼저 따른다. 관련 없는 미커밋 변경이 배포 산출물에 들어갈 수 있으면 범위를 정리하기 전 배포하지 않는다.
2. 요청된 환경과 대상 저장소의 `package.json`, `firebase.json`, `.firebaserc`를 대조한다. DEV는 `build:dev`와 `deploy:dev`, PRD는 `build:prd`와 `deploy:prd`를 사용한다. 환경별 Firebase 프로젝트 ID, Hosting 논리 타깃, 연결된 Hosting 사이트 ID, 배포 도메인이 확인되어야 한다. 앱 ID나 Hosting 사이트 ID를 다른 저장소에서 복사하거나 추측하지 않는다.
3. [references/access-and-secrets.md](references/access-and-secrets.md)를 읽습니다. Firebase CLI 계정, gcloud CLI 계정, ADC 주체와 프로젝트 IAM 권한을 구분하고 `AGENTS.local.md`에 지정된 해당 환경 주체와 일치하는지 확인합니다. 계정이나 프로젝트 접근 권한을 확인할 수 없으면 배포를 중단하고 필요한 확인 항목을 보고합니다.
4. [references/firebase-hosting.md](references/firebase-hosting.md)를 읽고 선택 환경의 빌드·배포 명령과 Hosting 전용 배포 범위를 검증한다. `firebase deploy`만 단독 실행하지 않는다.
5. 요청 환경의 빌드 스크립트와 관련 검사를 실행한다. 배포 스크립트가 이미 같은 빌드를 다시 실행한다면 불필요하게 중복 빌드하지 않는다. 빌드가 실패하거나 실제 프로젝트·타깃·사이트 연결이 모호하면 배포하지 않는다. DEV와 PRD의 스크립트·mode·프로젝트·사이트를 서로 바꾸어 사용하지 않는다.
6. 사용자 요청과 일치하는 환경에만 배포한다. 배포가 성공하면 CLI 결과와 프로젝트·타깃을 확인하고, 설정된 도메인의 HTTP 응답을 점검한다. 화면 동작까지 확인해야 하면 프로젝트의 브라우저 규칙에 따라 Aside로 확인한다.

## 보고

소스 브랜치와 커밋, 배포 전 작업 트리 상태, 빌드·검사 결과, Firebase 프로젝트와 Hosting 타깃, CLI 배포 결과, 배포 후 HTTP 상태를 구분해 보고한다. 브라우저에서 보지 않은 화면은 시각 검증했다고 말하지 않는다. 이 스킬은 배포만 담당하며 커밋, push, PR 생성·병합은 대상 저장소의 `AGENTS.md`와 참조 규칙을 따른다.

## KP Skill 관계와 관리자 설치

- 이 Skill을 프로젝트에서 사용할 때는 동일한 프로젝트·에이전트 경로에 `kp-skill-manager`의 세 Skill이 있는지 확인합니다. 없으면 manager의 역할과 필요한 설치 경로를 설명하고 설치 동의를 받은 뒤에만 manager 전체를 프로젝트 로컬로 설치합니다. 거부하면 KP Skill 작업을 진행하지 않습니다. 사용자가 manager 설치를 직접 요청한 경우는 설치 동의로 봅니다.
- 다른 KP Skill이 필요해지면 아래 정본 문서 또는 현재 에이전트의 `.agents/skills/kp-skill-install/references/`나 `.claude/skills/kp-skill-install/references/`에 있는 관계표를 읽습니다. 필요한 Skill이 없으면 이유와 이름을 알리고 추가 설치 동의를 구합니다. 동의한 Skill만 설치하며 관계표의 모든 Skill을 무조건 실행하지 않습니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-app-deploy/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-app-deploy/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 manager 선행 조건은 [플러그인 안내](../../README.ko.md)를 확인합니다.
- 정본 관계표: `kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md`.
