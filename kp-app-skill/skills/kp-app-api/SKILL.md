---
name: kp-app-api
description: "초기화된 KP React 앱에 새 KP API 기능을 연결하거나 기존 API 연동을 수정할 때 사용합니다."
metadata:
  version: "2.6.0"
---

# KP 앱 API 연동

사용자가 요청한 API 기능을 기존 KP 앱 구조에 연결한다. 새 프로젝트 초기화, KP API 서버 자체의 변경, 사용자 요청과 무관한 API 목록 전체 구현은 맡지 않는다.

## 진행 기준

1. 대상 저장소의 `AGENTS.md`, 필요한 경우 `AGENTS.local.md`, 현재 코드와 테스트를 확인한다. 기능 요구와 사용할 환경(DEV 또는 PRD)을 확인하고, 이미 확정된 값을 다시 묻지 않는다.
2. [kp-app-init의 API·보안 기준](../kp-app-init/references/kp-api-and-security.md)을 읽는다. 대상 에이전트의 브라우저 규칙을 따라 올바른 Developer Center에 접속하고, 계정 정보를 `AGENTS.local.md`에서 확인한 뒤 현재 로그인 계정이 맞는지 검증한다.
3. 요청 기능에 필요한 공식 API 계약만 확인한다. HTTP method, endpoint, 인증 방식, `app_id`, 요청·응답 필드, 페이지네이션, 오류 응답, 최소 권한과 부작용을 대조한다. DEV와 PRD 계약이 다르면 각각 확인한다. 문서에서 확인되지 않은 계약을 추측하지 않는다.
4. 확인한 계약과 문서 URL을 `docs/kp-api-analysis.md`에 추가하거나 갱신한다. 기존 문서와 API 지도를 보존하고 요청 범위와 무관한 항목은 고치지 않는다.
5. 기존 구조를 따라 `src/schema/`에 필요한 Zod 스키마를 두고, `src/api/`의 도메인 함수는 공통 `kpClient`를 사용한다. 서버 상태는 `src/hook/query/`의 TanStack Query hook으로 연결하고, 성공·실패 후 필요한 query invalidation을 적용한다. 서버 응답을 Zustand에 중복 저장하지 않는다.
6. 기존 컴포넌트·페이지와 사용자 경험에 맞춰 요청한 화면 동작을 연결한다. 별도 service 계층이나 대규모 구조 변경은 요구 근거와 현재 소비자 확인 없이 추가하지 않는다.
7. API 함수와 query/mutation을 중심으로 관련 테스트를 실행하거나 추가한다. 인증 토큰·앱 비밀값을 로그, 코드, 브라우저 번들에 노출하지 않는다. 발송, 결제, 삭제, 일괄 변경 등 실제 부작용을 동반하는 API는 사용자의 별도 명시적 요청 없이 호출해 검증하지 않는다.
8. 변경된 동작, 참조한 API 계약, 실행한 검사와 남은 한계를 보고한다. 코드·모의 테스트 결과를 실제 외부 서비스 동작 확인으로 표현하지 않는다.

API 계약, 인증, 데이터 소유권의 세부 원칙은 위에 연결한 `kp-app-init` 참조 문서를 기준으로 한다. 계정·프로젝트 환경이 불명확하거나 Developer Center에서 계약을 확인할 수 없으면 해당 연동을 추측 구현하지 말고 필요한 정보와 막힌 범위를 설명한다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | KP API endpoint | 앱의 `kpClient`를 통해 호출합니다. method·path·auth·request·response는 endpoint별로 확인하며, 부작용이 있는 endpoint는 별도 요청 없이 호출하지 않습니다. | [DEV Developer Center](https://developer-kpcenter-dev.web.app/api/), [PRD Developer Center](https://developer-kpcenter.web.app/api/)의 해당 endpoint 문서 |
| CLI | Git | 저장소 상태를 `git status --short --branch`로 확인합니다. | [git status](https://git-scm.com/docs/git-status) |
| CLI | Package manager | lockfile과 `package.json`에서 manager 및 script를 확인하고 `<PACKAGE_MANAGER> run <SCRIPT_NAME>`으로 test·lint·format을 실행합니다. | [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| 기타 | TypeScript·Zod·TanStack Query·test 도구·브라우저 | 대상 앱의 기존 의존성과 브라우저 규칙을 따릅니다. | — |

## KP Skill 관계와 관리자 설치

- 이 Skill을 프로젝트에서 사용할 때는 동일한 프로젝트·에이전트 경로에 `kp-skill-manager`의 세 Skill이 있는지 확인합니다. 없으면 manager의 역할과 필요한 설치 경로를 설명하고 설치 동의를 받은 뒤에만 manager 전체를 프로젝트 로컬로 설치합니다. 거부하면 KP Skill 작업을 진행하지 않습니다. 사용자가 manager 설치를 직접 요청한 경우는 설치 동의로 봅니다.
- 다른 KP Skill이 필요해지면 아래 정본 문서 또는 현재 에이전트의 `.agents/skills/kp-skill-install/references/`나 `.claude/skills/kp-skill-install/references/`에 있는 관계표를 읽습니다. 필요한 Skill이 없으면 이유와 이름을 알리고 추가 설치 동의를 구합니다. 동의한 Skill만 설치하며 관계표의 모든 Skill을 무조건 실행하지 않습니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-app-api/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-app-api/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 manager 선행 조건은 [플러그인 안내](../../README.ko.md)를 확인합니다.
- 정본 관계표: `kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md`.
