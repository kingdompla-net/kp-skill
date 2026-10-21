# KP 앱 초기화 Skill

버전: 1.0.0

화면 설계가 끝난 React 저장소를 KP API 앱으로 초기화합니다. 제공된 화면을 보존하면서 KP 인증과 환경 설정을 연결하고, 실제 소스 구조에 맞는 프로젝트 지침을 만듭니다.

기준 Skill은 `skills/kp-app-start-skill/`에 있습니다. API·보안 지침, IDE 설정 참고 자료, 재사용 가능한 코드 템플릿을 함께 포함합니다.

## 설치

### 1. 네 에이전트 공용 Skill (`npx skills`)

참고 자료와 템플릿을 포함한 전체 Skill 디렉터리를 Codex, Claude Code, Hermes Agent, OpenClaw에 설치합니다.

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-start-skill \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes --full-depth
~~~

에이전트 하나만 설치하려면 `--agent` 뒤에 해당 에이전트 하나만 지정합니다. 예: `--agent codex`.

### 2. Codex 네이티브 플러그인

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
codex plugin marketplace add "$REMOTE_REPO" --ref main
codex plugin add "kp-app-start-skill@kp-skill"
~~~

설치 후 새 Codex 세션을 시작합니다.

### 3. Claude Code 네이티브 플러그인

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
claude plugin marketplace add "$REMOTE_REPO"
claude plugin install "kp-app-start-skill@kp-skill"
~~~

### 4. Hermes Agent 네이티브 Skill

~~~bash
RAW_REPO="${RAW_REPO:-https://raw.githubusercontent.com/kingdompla-net/kp-skill/main}"
hermes skills install "$RAW_REPO/plugins/kp-app-start-skill/skills/kp-app-start-skill/SKILL.md" --yes
~~~

직접 URL 설치는 진입점인 `SKILL.md`를 설치합니다. 전체 참고 자료와 템플릿이 필요하면 공용 `npx skills` 설치 방식을 사용합니다.

### 5. OpenClaw 네이티브 Skill

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
repo_dir="$(mktemp -d)/kp-skill"
git clone --depth 1 "$REMOTE_REPO.git" "$repo_dir"
target="$HOME/.openclaw/skills/kp-app-start-skill"
mkdir -p "$target"
cp -R "$repo_dir/plugins/kp-app-start-skill/skills/kp-app-start-skill/." "$target/"
openclaw skills list
~~~

공용 설치는 네 에이전트 모두에 전체 디렉터리를 설치합니다. 네이티브 플러그인과 Skill 설치는 각 에이전트가 지원하는 방식으로 진행합니다.

## 사용

화면 설계 소스가 준비된 저장소를 KP API 앱으로 초기화할 때 현재 에이전트의 Skill 인터페이스에서 `kp-app-start-skill`을 호출합니다. 프로젝트별 정보가 부족하면 필요한 항목을 요청하고, 대상 환경의 KP Developer Center 문서를 확인하며, 계정 정보는 대상 저장소의 무시된 `AGENTS.local.md`에 보관하도록 안내합니다.
