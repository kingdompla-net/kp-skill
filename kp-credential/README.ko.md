# KP Credential

버전: 1.1.0

`kp-credential` 플러그인은 macOS Keychain 또는 Windows Credential Manager에 저장된 API header credential을 관리하는 `kp-credential` Skill을 제공합니다. 실제 값은 CLI의 숨김 입력으로 OS 자격 증명 저장소에 기록하며, agent는 승인된 HTTPS 범위의 요청에만 사용합니다.

| Skill | 버전 | 언제 사용하나 | 역할 |
| --- | --- | --- | --- |
| [`kp-credential`](skills/kp-credential/SKILL.md) | `1.1.0` | API credential을 저장·확인·승인·사용·삭제할 때 | OS를 판별해 Keychain 또는 Credential Manager를 사용하고, 에이전트는 승인된 `request`로 API에 접근합니다. |

## 프로젝트 로컬 설치

`kp-credential` Skill에는 같은 프로젝트·에이전트 경로의 manager 세 Skill 전체가 필요합니다. credential Skill만 설치되어 있고 manager가 빠졌으면 credential 작업을 시작하기 전에 Skill 지침에 따라 manager 전체를 자동 설치합니다. `kp-app-skill`과 `kp-api-skill` manifest는 manager와 이 플러그인을 필수 의존성으로 선언합니다.

Skills CLI 복사 설치는 플러그인 의존성이나 OS npm package를 자동 설치하지 않습니다. 아래 명령은 manager·credential Skill 파일을 미리 복사하려는 경우 사용합니다. agent가 앱/API Skill 설치를 진행하면 빠진 manager·credential Skill을 설치하고, CLI를 OS 사용자 환경에 설치·확인합니다. 사용자가 Skills CLI를 직접 실행한 경우에는 credential 작업 전에 agent가 CLI를 준비합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --copy --yes
~~~

설치 경로는 Codex가 `.agents/skills/`, Claude Code가 `.claude/skills/`입니다. `--global` 또는 `-g`는 사용자 전역 설치를 명시적으로 요청한 경우에만 사용합니다.

## CLI 설치

CLI package는 `kp-credential` Skill 폴더에 함께 배포됩니다. 앱/API Skill 설치 중 credential dependency를 복사하면 에이전트가 같은 설치 작업에서 CLI를 현재 OS 사용자의 npm 전역 환경에 설치·갱신하고, `kp-credential --version`과 PATH 명령 탐색을 확인합니다. 사용자는 저장소 clone, CLI 다운로드, 경로 입력, 설치 명령 실행을 하지 않아도 됩니다. Skills CLI를 직접 실행해 Skill 파일만 복사한 경우에는 agent가 credential 작업 전에 CLI 준비를 완료합니다. Node.js 20 이상, npm, registry 접근과 사용자 쓰기 가능한 npm 전역 prefix가 필요합니다. 자세한 내용은 [CLI 안내](skills/kp-credential/CLI.md)를 확인해 주세요.

비밀값 저장은 `kp-credential add <항목라벨>`의 숨김 입력을 사용합니다. 값은 채팅, 명령 인수, `AGENTS.local.md`, `.env` 또는 shell profile에 넣지 않습니다. 도구가 임의 CLI 환경 변수 주입이나 브라우저 로그인 form 자동 입력을 지원하지 않습니다.

## 사용 범위

저장된 credential을 직접 출력하지 않습니다. `grant`는 사용자가 승인한 HTTPS origin·path·method·header만 허용하고, `request`는 해당 범위에서 API 요청을 실행합니다. 응답 본문에 비밀이 포함될 가능성이 있는 endpoint에는 권한을 승인하지 않습니다. OS 저장소의 값은 컴퓨터 간에 자동 동기화되지 않습니다.
