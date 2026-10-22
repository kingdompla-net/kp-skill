# KP API Skill 프로젝트 로컬 설치

`kp-api-init`을 마칠 때 `kp-api-skill` 플러그인의 일곱 Skill을 초기화 대상 저장소에 설치합니다. 이미 운영 중인 저장소에서도 초기화 없이 전체 Skill 묶음을 프로젝트 로컬로 직접 설치할 수 있습니다.

## 필수 관리자 Skill

KP Skill을 하나라도 프로젝트에 설치할 때는 `kp-skill-manager` 플러그인의 Skill 전체도 같은 프로젝트와 에이전트 경로에 있어야 합니다. 없는 경우 manager가 Skill 생성·릴리스·설치 갱신과 관계표를 제공한다는 점을 사용자에게 설명하고, 설치 동의를 받은 뒤에만 먼저 설치합니다. 사용자가 거부하면 API Skill 설치를 진행하지 않습니다. `--yes`는 동의를 받은 뒤에만 사용합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
~~~

## 새 API 저장소 초기화

1. 설치 대상이 저장소 루트인지 확인합니다. 기존 API codebase만 추가하더라도 저장소 루트의 프로젝트 Skill 경로를 사용합니다.
2. 대상 agent를 확인하고 `npx skills`가 현재 지원하는 프로젝트 경로를 사용합니다. Codex는 `.agents/skills/`, Claude Code는 `.claude/skills/`를 사용하며, 다른 agent는 [공식 CLI agent 목록](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)을 확인합니다.
3. 현재 `kp-api-init`, 원격 `kp-api-skill` plugin과 각 Skill의 version이 일치하는지 확인합니다. 다른 버전을 섞지 않습니다.
4. 기존 `kp-api-*` Skill 경로와 사용자 수정 내용을 확인합니다. 로컬 변경을 자동으로 덮어쓰지 않고 보존해 병합합니다.
5. 플러그인의 일곱 Skill 전체를 대상 agent 프로젝트에 복사합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --copy --yes
~~~

Claude Code이면 `--agent claude-code`, Hermes Agent이면 `--agent hermes-agent`, OpenClaw이면 `--agent openclaw`를 사용합니다. 여러 agent 디렉터리에 설치할 때는 `--agent` 옵션을 반복합니다.

manager 설치 명령에서 같은 agent 목록을 사용해 먼저 manager 전체를 설치한 뒤 API Skill을 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

`npx skills`는 기본적으로 현재 프로젝트에 설치합니다. repository 안에서만 사용하려면 `--global` 또는 `-g`를 추가하지 않습니다. 최신 option은 [공식 command 문서](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)에서 확인합니다.

## 기존 API 저장소

기존 codebase에서 Skill을 사용하려고 재초기화하지 않습니다. 저장소 루트에서 다음 명령으로 네 agent 경로에 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

## 설치 확인과 업데이트

- `kp-skill-manager` 세 Skill과 API 플러그인의 일곱 Skill 및 연결된 참조 자료가 프로젝트 경로에 있는지 확인합니다.
- 각 Skill의 `metadata.version`이 해당 plugin version과 일치하는지 확인합니다.
- 설치 결과를 `git status --short`로 확인하고 사용자 local 수정 사항을 보존합니다.
- 정본은 `kp-skill` 저장소입니다. upstream update 이후 `npx skills update`를 실행하고 변경을 검토합니다. 프로젝트 복사본만 임의 수정해 정본과 다르게 관리하지 않습니다.
