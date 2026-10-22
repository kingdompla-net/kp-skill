# KP 앱 Skill

버전: 2.5.0

`kp-app-skill`은 KP React 앱 초기화, API 연동, Firebase Hosting 배포에 필요한 프로젝트 로컬 Skill을 제공합니다.

| Skill | 버전 | 언제 사용하나 | 역할 |
| --- | --- | --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | `2.5.0` | 설계된 React 저장소를 KP 앱으로 처음 연결할 때 | 기존 화면을 보존하며 KP API, Firebase 환경, 앱 지침과 검증 명령을 구성하고 플러그인의 세 Skill을 현재 에이전트용 프로젝트 경로에 설치합니다. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | `2.5.0` | 이미 초기화된 앱에 기능을 추가하거나 KP API 연동을 수정할 때 | 공식 API 계약을 확인해 기존 앱 구조와 query/state 경계에 연결합니다. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | `2.5.0` | 사용자가 DEV 또는 PRD Hosting 배포를 요청했을 때 | 대상 Firebase 프로젝트와 Hosting 타깃을 확인하고 Hosting만 배포합니다. |

초기화 과정에서 대상 앱 `package.json`에 `build:dev`·`deploy:dev`를 만들고, PRD 프로젝트 ID와 Hosting 사이트 ID가 확인되면 `build:prd`·`deploy:prd`도 추가합니다. 초기화가 끝나면 세 Skill을 현재 대화에서 사용하는 에이전트의 프로젝트 로컬 경로에 설치합니다. 비밀번호와 token은 `AGENTS.local.md`에 기록하지 않고 OS Keychain이나 조직 비밀 저장소에 두며, 필요한 프로세스에만 전달합니다.

## 생성 저장소의 Git 규칙

각 작업 맥락은 구현과 직접 검증이 끝날 때마다 별도 커밋으로 남깁니다. 전체 검증이 끝나면 확인된 base 대상 PR을 만들고 필수 검사와 리뷰가 끝난 뒤 병합합니다. PR 없이 브랜치를 base에 직접 병합하거나 `main`/`dev`에 직접 push하려면 실행 직전에 사용자의 명시적 승인을 받아야 합니다. 커밋 전에 활성 GitHub 계정과 Git author·committer identity가 같은 계정인지 확인하고, 이메일은 그 계정에 인증된 주소 또는 GitHub noreply 주소를 사용합니다. 계정과 프로젝트 ID는 대상 저장소에서 Git 추적을 제외한 `AGENTS.local.md`에 두되 비밀값은 넣지 않습니다.

## 설치

모든 KP Skill에는 같은 프로젝트·에이전트 범위의 `kp-skill-manager` 세 Skill 전체가 필요합니다. 설치되어 있지 않으면 필요한 이유와 경로를 설명하고 사용자 동의를 받은 뒤 manager를 먼저 설치합니다. 거부하면 앱 Skill 설치를 진행하지 않습니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex --copy --yes
~~~

### 새 저장소 초기화

초기화 대상 저장소 루트에서 시작 Skill을 프로젝트 로컬로 설치합니다. 기존 코드베이스에서는 초기화 Skill을 사용할 필요가 없습니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill kp-app-init -a codex --copy --yes
~~~

초기화가 끝나면 `kp-app-init`, `kp-app-api`, `kp-app-deploy` 세 Skill이 현재 에이전트의 프로젝트 로컬 경로에 설치됩니다.

### 기존 저장소 또는 여러 에이전트 설치

기존 프로젝트에서는 초기화를 거치지 말고 전체 Skill을 설치합니다. `--agent`는 반복 옵션이며, 아래는 네 에이전트의 프로젝트 경로에 모두 복사하는 예입니다.

manager가 같은 에이전트 경로에 없다면 아래 대상 Skill 명령보다 먼저 manager 전체를 같은 `-a` 옵션으로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

한 에이전트만 사용하려면 그 `-a` 옵션 하나만 둡니다. 기본 범위는 현재 프로젝트입니다. 저장소 안에만 설치하려면 `--global` 또는 `-g`를 추가하지 않습니다.

### 업데이트와 네이티브 플러그인

정본 Skill은 `kp-skill` 저장소에 있습니다. 대상 프로젝트 루트에서 `npx skills update`를 실행한 뒤 변경된 파일을 검토하고 로컬 수정을 보존합니다. 네이티브 플러그인은 에이전트마다 지원 범위가 다릅니다. 사용자 단위로만 설치되는 경우 저장소 전용 설치를 원한다면 위 프로젝트 로컬 설치를 사용합니다.

## 사용

설계 소스를 처음 연결할 때 `kp-app-init`, 기존 앱에 KP API 기능을 연결할 때 `kp-app-api`, 사용자가 환경을 지정해 Hosting 배포를 요청할 때 `kp-app-deploy`를 사용합니다.
