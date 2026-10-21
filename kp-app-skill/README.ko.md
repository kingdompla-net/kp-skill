# KP 앱 Skill

버전: 2.4.0

`kp-app-skill` 플러그인은 KP React 앱의 초기화, API 연동, Firebase Hosting 배포를 돕는 Skill을 제공합니다.

| Skill | 역할 |
| --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | 화면 설계가 끝난 React 소스를 KP API 앱으로 초기화하고, 확인된 인증·환경 설정과 프로젝트 지침을 연결합니다. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | 요청된 DEV 또는 PRD Firebase Hosting 환경을 검증하고 배포합니다. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | 공식 KP API 계약을 확인해 초기화된 앱의 요청 기능에 연결합니다. |

초기화 Skill에는 API·보안 지침, IDE 설정 자료, 재사용 가능한 코드 템플릿이 들어 있습니다. 초기화 과정에서 대상 앱의 `package.json`에 `build:dev`·`deploy:dev`를 만들고, PRD 프로젝트 ID와 Hosting 사이트 ID가 확인되면 `build:prd`·`deploy:prd`도 추가합니다. 초기화가 끝나면 세 Skill을 현재 에이전트의 프로젝트 로컬 경로에 설치합니다.

## 생성 저장소의 Git 규칙

생성되는 저장소 규칙은 각 작업 맥락의 구현과 직접 검증이 끝날 때마다 별도 커밋으로 남깁니다. 모든 맥락의 검증이 끝나면 확인된 base 대상 PR을 만들고 필수 검사와 리뷰가 끝난 뒤 병합합니다. PR 없이 브랜치를 base에 직접 병합하려면 사전에 사용자의 명시적 승인을 받아야 합니다. `main`/`dev` 직접 push도 push 직전에 명시적 승인을 받아야 합니다. 커밋 전에 활성 GitHub 계정과 Git author·committer identity가 같은 계정인지 확인하고, 각 커밋 이메일이 해당 계정에 인증된 이메일이거나 그 계정의 GitHub noreply 주소인지 검증합니다. 계정별 identity 정보는 대상 저장소에서 Git 추적을 제외한 `AGENTS.local.md`에 둡니다. Firebase Hosting은 DEV에서 `vite build --mode development`와 `hosting:dev`, PRD에서 `vite build --mode production`과 `hosting:prd`를 사용하며, 환경별 실제 Firebase 프로젝트 ID와 Hosting 사이트 ID를 확인합니다. 초기화 Skill은 세 플러그인 Skill과 Biome·ESLint 설정용 보조 Skill을 대상 저장소의 에이전트별 프로젝트 경로에만 설치합니다.

## 설치

### 1. 에이전트 공용 초기화 Skill (`npx skills`)

초기화에 필요한 `kp-app-init` Skill 디렉터리를 Codex, Claude Code, Hermes Agent, OpenClaw 중 선택한 사용자 계정에 설치합니다. 이것은 초기화용 시작 Skill이며, 초기화 과정에서는 플러그인의 모든 Skill을 대상 저장소에 프로젝트 로컬로 복사합니다.

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-init \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes
~~~

초기화가 끝난 저장소에서는 `kp-app-init`, `kp-app-deploy`, `kp-app-api` 세 Skill을 현재 에이전트의 프로젝트 경로에서 사용합니다. 이 복사 과정에는 `--global`을 사용하지 않습니다.

에이전트 하나만 설치하려면 `--agent` 뒤에 해당 에이전트 하나만 지정합니다. 예: `--agent codex`.

### 2. Codex 네이티브 플러그인

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
codex plugin marketplace add "$REMOTE_REPO" --ref main
codex plugin add "kp-app-skill@kp-skill"
~~~

설치 후 새 Codex 세션을 시작합니다.

### 3. Claude Code 네이티브 플러그인

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
claude plugin marketplace add "$REMOTE_REPO"
claude plugin install "kp-app-skill@kp-skill"
~~~

### 4. Hermes Agent 네이티브 Skill

~~~bash
RAW_REPO="${RAW_REPO:-https://raw.githubusercontent.com/kingdompla-net/kp-skill/main}"
hermes skills install "$RAW_REPO/kp-app-skill/skills/kp-app-init/SKILL.md" --yes
~~~

직접 URL 설치는 진입점인 `SKILL.md`를 설치합니다. 전체 참고 자료와 템플릿이 필요하면 공용 `npx skills` 설치 방식을 사용합니다.

### 5. OpenClaw 네이티브 Skill

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
repo_dir="$(mktemp -d)/kp-skill"
git clone --depth 1 "$REMOTE_REPO.git" "$repo_dir"
target="$HOME/.openclaw/skills/kp-app-init"
mkdir -p "$target"
cp -R "$repo_dir/kp-app-skill/skills/kp-app-init/." "$target/"
openclaw skills list
~~~

공용 설치는 네 에이전트 모두에 전체 디렉터리를 설치합니다. 네이티브 플러그인과 Skill 설치는 각 에이전트가 지원하는 방식으로 진행합니다.

## 사용

화면 설계 소스가 준비된 저장소를 초기화할 때 `kp-app-init`, 기존 앱에 KP API 기능을 연결할 때 `kp-app-api`, 사용자가 환경을 지정해 Hosting 배포를 요청할 때 `kp-app-deploy`를 사용합니다.
