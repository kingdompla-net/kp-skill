# KP API Skill 프로젝트 로컬 설치

`kp-api-init`이 끝나면 이 문서에 따라 `kp-api-skill`의 누락된 Skill만 초기화 대상 저장소에 설치합니다. API 초기화 전에 `kp-skill-manager`와 `kp-credential` 전체 Skill을 확인하고, 빠진 항목은 사용자에게 작업·Skill 이름·경로를 알린 뒤 자동 설치합니다. `kp-credential` Skill 복사가 끝나면 같은 설치 작업에서 설치된 Skill의 `scripts/install-global.mjs`를 실행해 CLI package를 OS 사용자 npm 전역 환경에 설치·갱신하고 `kp-credential --version` 및 명령 탐색을 확인합니다. `kp-api-init`은 앱 플러그인이나 다른 선택 KP 플러그인의 Skill을 설치하지 않습니다. 이미 운영 중인 저장소에서도 초기화 없이 API Skill 전체 묶음을 프로젝트 로컬로 직접 설치할 수 있습니다.

## 필수 companion plugin

API Skill을 하나만 설치해도 `kp-skill-manager`의 전체 세 Skill과 `kp-credential`의 전체 Skill이 같은 프로젝트·에이전트 경로에 필요합니다. 빠진 의존성은 필요한 작업, Skill 이름, 경로를 사용자에게 알린 뒤 자동 설치합니다. `kp-credential` Skill 복사가 끝나면 같은 설치 작업 안에서 설치된 Skill의 `scripts/install-global.mjs`를 실행해 CLI package를 OS 사용자 npm 전역 환경에 설치하고, `kp-credential --version`과 일반 명령 탐색을 확인합니다. Skills CLI는 manifest dependency와 OS npm package를 자동 처리하지 않습니다. 아래 명령은 미리 Skill 파일을 복사하려는 경우에 사용하며, 사용자가 Skills CLI만 직접 실행한 경우에는 API 작업 전에 agent가 helper로 CLI 설치·PATH 확인을 마칩니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --copy --yes
~~~

## 새 API 저장소 초기화

1. 설치 대상이 저장소 루트인지 확인합니다. 기존 API codebase만 추가하더라도 저장소 루트의 프로젝트 Skill 경로를 사용합니다.
2. 대상 agent를 확인합니다. `npx skills add`는 명령을 실행한 저장소를 기본 프로젝트 범위로 사용합니다. Codex는 `.agents/skills/`, Claude Code는 `.claude/skills/`를 사용합니다. 사용자 전역 설치에는 `--global` 또는 `-g`가 필요하므로 명시적 요청 없이 사용하지 않습니다. 다른 agent는 [공식 CLI agent 목록](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)을 확인합니다.
3. 현재 `kp-api-init`, 원격 `kp-api-skill` plugin과 각 Skill의 version이 일치하는지 확인합니다. 다른 버전을 섞지 않습니다.
4. 기존 `kp-api-*` Skill 경로와 사용자 수정 내용을 확인합니다. 로컬 변경을 자동으로 덮어쓰지 않고 보존해 병합합니다.
5. 초기 진입 단계에서는 `kp-api-init`만 대상 agent 프로젝트에 복사합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill kp-api-init --agent codex --copy --yes
~~~

Skills CLI는 플러그인 이름으로 디렉터리를 중첩하지 않습니다. 각 Skill은 `<agent-project-skill-dir>/<skill-name>/` 아래에 직접 놓입니다. 예를 들어 Codex에서는 `.agents/skills/kp-api-init/`, Claude Code에서는 `.claude/skills/kp-api-init/`입니다.

초기화가 끝난 뒤 기존 API Skill 파일·버전·사용자 수정을 확인하고, 없는 Skill만 설치합니다. 다른 여섯 Skill이 모두 없다면 다음 명령을 사용합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill kp-api-endpoint kp-api-worker kp-api-test-deploy kp-api-build kp-api-deploy kp-api-docs \
  --agent codex --copy --yes
~~~

이미 존재하는 Skill을 자동으로 덮어쓰지 않습니다. 로컬 수정이 있으면 보존해 병합하고 결과를 확인합니다. 설치가 끝난 Codex 경로는 다음과 같습니다.

~~~text
<project>/.agents/skills/
├── kp-skill-create/
├── kp-skill-release/
├── kp-skill-install/
├── kp-credential/
├── kp-api-init/
├── kp-api-endpoint/
├── kp-api-worker/
├── kp-api-test-deploy/
├── kp-api-build/
├── kp-api-deploy/
└── kp-api-docs/
~~~

Claude Code에서는 같은 Skill 이름의 폴더가 `.claude/skills/` 바로 아래에 놓입니다. plugin 이름을 위한 상위 폴더는 없습니다.

Claude Code이면 `--agent claude-code`, Hermes Agent이면 `--agent hermes-agent`, OpenClaw이면 `--agent openclaw`를 사용합니다. 여러 agent 디렉터리에 설치할 때는 `--agent` 옵션을 반복합니다.

미리 설치하려는 경우 manager와 credential 명령에서 같은 agent 목록을 사용합니다. 빠진 dependency는 API Skill 실행 시 자동 설치되므로 설치를 선행할 필요는 없습니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

`npx skills`는 기본적으로 현재 프로젝트에 설치합니다. repository 안에서만 사용하려면 `--global` 또는 `-g`를 추가하지 않습니다. 최신 option은 [공식 command 문서](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)에서 확인합니다.

## 기존 API 저장소

기존 codebase에서 Skill을 사용하려고 재초기화하지 않습니다. 저장소 루트에서 다음 명령으로 네 agent 경로에 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

## 설치 확인과 업데이트

- `kp-skill-manager` 세 Skill, `kp-credential` 전체 Skill, API 플러그인의 일곱 Skill 및 연결된 참조 자료가 프로젝트 경로에 있는지 확인합니다.
- `kp-credential` CLI가 OS 사용자 전역 npm 환경에 설치돼 있고 `kp-credential --version`과 일반 command lookup이 성공하는지 확인합니다.
- 각 Skill의 `metadata.version`이 해당 plugin version과 일치하는지 확인합니다.
- 설치 결과를 `git status --short`로 확인하고 사용자 local 수정 사항을 보존합니다.
- 정본은 `kp-skill` 저장소입니다. upstream update 이후 `npx skills update`를 실행하고 변경을 검토합니다. 프로젝트 복사본만 임의 수정해 정본과 다르게 관리하지 않습니다.
