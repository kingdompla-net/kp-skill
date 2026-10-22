# KP Skill 관계표와 생성·버전·네이밍 원칙

이 문서는 `kp-skill` 저장소의 모든 Skill 사이의 연결 기준과 새 Skill 생성·버전 관리 원칙을 정의합니다. `kp-skill-manager`의 모든 Skill과 다른 KP Skill은 교차 작업이나 설치가 필요할 때 이 문서를 확인합니다.

## 필수 관리자 플러그인과 설치 동의

- `kp-skill`에서 제공하는 Skill을 프로젝트에 하나라도 설치할 때는 같은 프로젝트와 같은 에이전트 범위에 `kp-skill-manager` 플러그인의 Skill 전체를 함께 설치합니다. Codex 프로젝트 경로는 `.agents/skills/`, Claude Code 프로젝트 경로는 `.claude/skills/`입니다. 다른 에이전트는 해당 에이전트의 프로젝트 경로를 확인합니다.
- Skills CLI 복사 설치에서는 플러그인 이름으로 디렉터리를 중첩하지 않습니다. 각 Skill은 `<agent-project-skill-dir>/<skill-name>/SKILL.md`에 바로 설치합니다. 예를 들어 Codex는 `<project>/.agents/skills/kp-app-init/SKILL.md`, Claude Code는 `<project>/.claude/skills/kp-app-init/SKILL.md`를 사용합니다. `.agents/skills/kp-app-skill/kp-app-init/`처럼 플러그인 아래에 넣지 않습니다.
- `npx skills add`는 명령을 실행한 저장소를 기본 project scope로 사용합니다. 대상 프로젝트 루트에서 실행하고 `--global`/`-g`는 사용자가 전역 설치를 명시한 경우에만 지정합니다. global/project 경로 차이는 [Skills CLI 지원 에이전트 안내](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)에서 확인합니다.
- `kp-skill-manager`가 없으면 대상 Skill을 먼저 설치하거나 실행하지 말고, `kp-skill-manager` 플러그인이 이 프로젝트의 해당 에이전트에 필요하다는 점과 설치 경로를 설명한 뒤 설치 동의를 구합니다. 동의하면 manager의 Skill 전체를 먼저 설치하고 설치 결과를 확인한 뒤 대상 Skill을 설치합니다. 거부하면 KP Skill 설치나 그에 의존하는 작업을 시작하지 않습니다.
- 사용자가 `kp-skill-manager`를 직접 설치해 달라고 요청한 경우에는 manager 자체 설치가 동의 범위에 포함됩니다. manager 플러그인 전체를 프로젝트 로컬로 설치하며 전역 경로를 사용하지 않습니다.
- 다른 KP Skill이 필요해지면 아래 관계표에서 해당 Skill을 확인합니다. 필요한 Skill이 같은 에이전트의 프로젝트 경로에 없으면 필요한 이유와 이름을 알려드리고 추가 설치 동의를 구합니다. 동의받은 Skill만 같은 프로젝트·에이전트 범위에 설치합니다. 필요하지 않은 선택 Skill을 미리 설치하지 않습니다.
- 설치된 Skill은 현재 에이전트가 지원하는 호출 방법으로 사용합니다. 직접 호출할 수 없는 환경에서는 해당 Skill의 `SKILL.md`를 읽어 그 절차를 적용합니다. 절차를 중복 구현하거나 전역 Skill을 대신 사용하지 않습니다.
- Skills CLI로 개별 Skill을 복사하는 설치 방식은 플러그인 의존성을 자동 설치하지 않습니다. 따라서 설치 안내는 manager를 먼저 설치하고 대상 플러그인을 설치하도록 안내하며, Skill 실행 시에도 이 절의 설치 여부를 확인합니다. Claude Code native plugin 설치는 앱·API 플러그인 manifest의 `kp-skill-manager` 의존성을 따릅니다.
- `kp-app-init`은 초기화 후 `kp-app-skill`에 속한 누락된 Skill만 같은 project·agent 경로에 설치합니다. `kp-api-init`은 `kp-api-skill`의 누락된 Skill만 설치합니다. 두 초기화 Skill은 서로의 플러그인을 설치하지 않으며, manager는 별도 필수 선행 설치입니다. 이미 존재하는 대상 Skill은 사용자 수정과 버전을 확인하지 않고 덮어쓰지 않습니다.
- 프로젝트 scope는 `<project>/.agents/skills/<skill-name>/`(Codex), `<project>/.claude/skills/<skill-name>/`(Claude Code)입니다. 사용자 scope는 `--global`/`-g`로 별도 선택하며 해당 agent의 global path를 사용합니다. plugin 전체 또는 선택 Skill 설치 명령은 각 plugin README를 기준으로 합니다.

## KP Skill 참조 관계표

manager 플러그인은 모든 KP Skill의 공통 필수 의존성입니다. 아래 표에는 공통 의존성을 반복하지 않고, 작업 맥락에 따라 이어서 사용할 Skill만 기록합니다.

| 플러그인 | Skill | 사용할 때 | 관련 작업으로 이어질 때 |
| --- | --- | --- | --- |
| [`kp-app-skill`](../../../../kp-app-skill/README.ko.md) | [`kp-app-init`](../../../../kp-app-skill/skills/kp-app-init/SKILL.md) | 설계된 React 저장소를 처음 KP 앱으로 연결할 때 | 초기화 뒤 앱 기능 연동은 [`kp-app-api`](../../../../kp-app-skill/skills/kp-app-api/SKILL.md), Hosting 배포는 [`kp-app-deploy`](../../../../kp-app-skill/skills/kp-app-deploy/SKILL.md)를 사용합니다. |
| `kp-app-skill` | [`kp-app-api`](../../../../kp-app-skill/skills/kp-app-api/SKILL.md) | 초기화된 앱의 KP API 기능을 추가·수정할 때 | API 서버 구현이 필요하면 [`kp-api-build`](../../../../kp-api-skill/skills/kp-api-build/SKILL.md)로 연결합니다. 구현 후 공개 API 문서를 준비해야 하면 배포 확인 뒤 [`kp-api-docs`](../../../../kp-api-skill/skills/kp-api-docs/SKILL.md)를 사용합니다. |
| `kp-app-skill` | [`kp-app-deploy`](../../../../kp-app-skill/skills/kp-app-deploy/SKILL.md) | 요청된 DEV 또는 PRD Firebase Hosting을 배포할 때 | 앱 코드 수정이 먼저 필요하면 [`kp-app-api`](../../../../kp-app-skill/skills/kp-app-api/SKILL.md)를 사용합니다. |
| [`kp-api-skill`](../../../../kp-api-skill/README.ko.md) | [`kp-api-init`](../../../../kp-api-skill/skills/kp-api-init/SKILL.md) | 새 API 도메인의 codebase와 최초 router를 준비할 때 | HTTP 기능은 [`kp-api-endpoint`](../../../../kp-api-skill/skills/kp-api-endpoint/SKILL.md), 비동기 작업은 [`kp-api-worker`](../../../../kp-api-skill/skills/kp-api-worker/SKILL.md), 격리 검증은 [`kp-api-test-deploy`](../../../../kp-api-skill/skills/kp-api-test-deploy/SKILL.md)를 사용합니다. 배포는 요청이 있을 때만 [`kp-api-deploy`](../../../../kp-api-skill/skills/kp-api-deploy/SKILL.md)로 진행합니다. |
| `kp-api-skill` | [`kp-api-endpoint`](../../../../kp-api-skill/skills/kp-api-endpoint/SKILL.md) | 기존 router에 동기 HTTP endpoint를 추가·수정할 때 | 범위가 넓은 도메인 기능은 [`kp-api-build`](../../../../kp-api-skill/skills/kp-api-build/SKILL.md), 비동기 처리는 [`kp-api-worker`](../../../../kp-api-skill/skills/kp-api-worker/SKILL.md), 격리 검증은 [`kp-api-test-deploy`](../../../../kp-api-skill/skills/kp-api-test-deploy/SKILL.md)를 사용합니다. |
| `kp-api-skill` | [`kp-api-worker`](../../../../kp-api-skill/skills/kp-api-worker/SKILL.md) | 재시도·예약 실행·장기 처리가 필요한 작업을 구현할 때 | 사용자 HTTP 요청 경로가 필요하면 [`kp-api-endpoint`](../../../../kp-api-skill/skills/kp-api-endpoint/SKILL.md), 여러 구성 요소가 필요한 작업은 [`kp-api-build`](../../../../kp-api-skill/skills/kp-api-build/SKILL.md), 격리 검증은 [`kp-api-test-deploy`](../../../../kp-api-skill/skills/kp-api-test-deploy/SKILL.md)를 사용합니다. |
| `kp-api-skill` | [`kp-api-test-deploy`](../../../../kp-api-skill/skills/kp-api-test-deploy/SKILL.md) | DEV·PRD와 분리된 환경에서 API 동작을 검증할 때 | 테스트에서 발견한 endpoint·worker 변경은 해당 구현 Skill로 돌아갑니다. 검증 뒤 사용자가 배포를 요청하면 [`kp-api-deploy`](../../../../kp-api-skill/skills/kp-api-deploy/SKILL.md)를 사용합니다. |
| `kp-api-skill` | [`kp-api-build`](../../../../kp-api-skill/skills/kp-api-build/SKILL.md) | 도메인 API를 필요한 구성만 선택해 끝까지 구현할 때 | 이 진입 Skill이 필요에 따라 [`kp-api-init`](../../../../kp-api-skill/skills/kp-api-init/SKILL.md), [`kp-api-endpoint`](../../../../kp-api-skill/skills/kp-api-endpoint/SKILL.md), [`kp-api-worker`](../../../../kp-api-skill/skills/kp-api-worker/SKILL.md), [`kp-api-test-deploy`](../../../../kp-api-skill/skills/kp-api-test-deploy/SKILL.md)를 연결합니다. 배포와 공개 문서화는 각각 별도 사용자 요청과 실제 배포 확인 뒤 진행합니다. |
| `kp-api-skill` | [`kp-api-deploy`](../../../../kp-api-skill/skills/kp-api-deploy/SKILL.md) | 사용자가 지정한 DEV 또는 PRD Functions 배포를 요청할 때 | 배포 전 [`kp-api-test-deploy`](../../../../kp-api-skill/skills/kp-api-test-deploy/SKILL.md) 검증을 확인합니다. 공개 endpoint 배포가 확인되면 [`kp-api-docs`](../../../../kp-api-skill/skills/kp-api-docs/SKILL.md)로 문서 작업을 준비합니다. |
| `kp-api-skill` | [`kp-api-docs`](../../../../kp-api-skill/skills/kp-api-docs/SKILL.md) | 배포가 확인된 공개 API 계약을 Center 문서로 반영할 때 | 실제 API 배포가 확인되지 않았고 사용자가 배포를 요청한 경우에만 [`kp-api-deploy`](../../../../kp-api-skill/skills/kp-api-deploy/SKILL.md)로 돌아갑니다. |
| [`kp-skill-manager`](../../../README.ko.md) | [`kp-skill-create`](../../kp-skill-create/SKILL.md) | 새 플러그인·Skill을 만들거나 프로젝트 로컬 Skill을 정본 후보로 가져올 때 | 릴리스 요청이 승인되면 [`kp-skill-release`](../../kp-skill-release/SKILL.md)를 사용합니다. 병합된 버전을 프로젝트에 적용할 때는 [`kp-skill-install`](../SKILL.md)을 사용합니다. |
| `kp-skill-manager` | [`kp-skill-release`](../../kp-skill-release/SKILL.md) | 승인된 KP Skill 변경을 버전업·릴리스하거나 이력을 조회할 때 | 새 Skill 파일과 플러그인 구성이 필요하면 [`kp-skill-create`](../../kp-skill-create/SKILL.md)를 먼저 사용합니다. 병합 후 설치본은 [`kp-skill-install`](../SKILL.md)로 갱신합니다. |
| `kp-skill-manager` | [`kp-skill-install`](../SKILL.md) | KP Skill을 특정 프로젝트에 설치하거나 병합된 버전으로 갱신할 때 | 원격 변경이 아직 병합되지 않았다면 업데이트하지 말고 [`kp-skill-release`](../../kp-skill-release/SKILL.md)의 상태를 확인합니다. 프로젝트 로컬 Skill을 정본으로 추가하려면 [`kp-skill-create`](../../kp-skill-create/SKILL.md)를 사용합니다. |

표의 관련 Skill은 같은 대화에서 무조건 모두 실행하는 목록이 아닙니다. 현재 요청의 단계가 해당 Skill의 책임에 들어올 때만 연결합니다. 배포, PR·병합, Preview, 외부 callback 같은 단계에는 각 Skill의 별도 승인 규칙이 계속 적용됩니다.

## 새 Skill 생성과 네이밍

- 새 플러그인 이름은 `kp-<영역>-skill` 형식으로 지정합니다. 예: `kp-app-skill`, `kp-api-skill`, `kp-skill-manager`입니다. 플러그인은 여러 관련 Skill의 배포 단위입니다.
- 새 KP 플러그인의 Claude manifest에는 `kp-skill-manager@kp-skill` 의존성을 포함합니다. manager 플러그인 자신에는 자기 의존성을 추가하지 않습니다. Skills CLI 복사 설치 안내에는 manager 전체를 먼저 설치하는 순서와 동의 규칙을 포함합니다.
- Skill 이름과 디렉터리 이름은 소문자 ASCII kebab-case로 동일하게 작성합니다. Skill 이름은 `kp-<영역>-<행동 또는 결과>` 형식을 우선하며, `kp-app-skill` 안에서 다시 `kp-app-skill`처럼 플러그인 이름 전체를 반복하지 않습니다. 예: `kp-app-init`, `kp-api-endpoint`, `kp-skill-release`입니다.
- 각 Skill은 식별 가능한 하나의 작업 책임을 맡습니다. 여러 단계를 조합하는 진입 Skill은 `kp-api-build`처럼 범위와 조합 기준을 분명히 하고, 기존 Skill의 단순 별칭이나 책임 중복을 만들지 않습니다.
- 프로젝트 로컬에서 검증한 Skill을 정본에 추가할 때는 원본 프로젝트를 보존하고 정본 후보로 검토합니다. 프로젝트 경로·계정·실제 값, 비밀정보, 그 저장소에만 맞는 규칙은 일반화하거나 제외합니다. 대상 플러그인의 기존 구성, 사용자 변경, 지원 에이전트 경로를 확인하고 승인 없이 설치본이나 다른 프로젝트를 덮어쓰지 않습니다.
- `SKILL.md` frontmatter의 `name`은 디렉터리 이름과 같게 작성합니다. `description`에는 적용되는 요청과 역할을 짧게 적고, 한국어 설명은 존댓말로 작성합니다. 긴 절차나 관계표는 references에 두고 `SKILL.md`에서 필요한 시점에 연결합니다.
- 새 Skill 버전은 `1.0.0`에서 시작합니다. Skill의 `metadata.version`은 개별 Skill 이력을, `.claude-plugin/plugin.json`과 marketplace의 버전은 해당 플러그인 패키지 이력을 나타냅니다. 한 Skill의 변경도 plugin package에 들어가면 플러그인 버전을 별도로 올립니다. 기존 버전을 임의로 초기화하지 않습니다.
- 버전 숫자는 사용자가 지정하도록 묻지 않습니다. 릴리스 요청이 승인된 뒤 변경 영향에 따라 SemVer를 정하고 Skill 정본·plugin manifest·marketplace·README를 일치시킵니다. 단순 로컬 편집·검토에서는 버전을 올리지 않습니다.

## 릴리스와 병합 완료 기준

- GitHub 계정이 kp-skill 관리자([bwlee-dix](https://github.com/bwlee-dix))가 아니면 승인된 변경을 PR로 제출합니다. PR 본문과 commit은 저장소 규칙을 따릅니다.
- 관리자의 “승인 완료”는 PR 리뷰 승인만을 뜻하지 않습니다. PR이 기본 브랜치에 실제로 병합되어 변경이 반영된 상태를 뜻합니다. 리뷰 승인은 병합과 릴리스 완료의 증거가 아닙니다.
- 병합이 확인되기 전에는 Skill이 배포됐다고 답하거나 프로젝트 설치본을 공개 정본으로 갱신하지 않습니다. 병합 후 원격 정본·버전을 확인하고, 요청된 프로젝트 범위에서 설치 갱신을 진행합니다.
- 병합은 원격 저장소의 기본 브랜치 변경 증거입니다. marketplace refresh, provider 설치본 변경, 실행 중 세션 reload는 별도로 확인하고 각각 보고합니다.
