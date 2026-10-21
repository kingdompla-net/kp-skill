# KP 앱 플러그인 Skill 프로젝트 로컬 설치

초기화가 끝날 때 `kp-app-skill` 플러그인의 모든 Skill을 초기화 대상 저장소에 설치한다. 설치 범위는 현재 대화에서 사용하는 에이전트 하나이며, 사용자 전역 Skill 경로는 사용하지 않는다.

## 설치 전 확인

1. 현재 작업 디렉터리가 초기화 대상 저장소의 루트인지 확인한다.
2. 실제 활성 에이전트를 확인한다. Codex는 `.agents/skills/`, Claude Code는 `.claude/skills/`, Hermes Agent는 `.hermes/skills/`, OpenClaw는 `skills/`를 프로젝트 로컬 경로로 사용한다. 다른 에이전트는 현재 설치 문서의 프로젝트 경로를 확인한다.
3. 현재 실행 중인 `kp-app-init`의 버전과 원격 `kp-app-skill` 플러그인의 버전, 각 Skill의 `metadata.version`이 일치하는지 확인한다. 원격 기본 브랜치 버전이 다르거나 버전을 확인할 수 없으면 섞어 설치하지 말고 같은 버전의 원격 참조를 확보한다.
4. 대상 에이전트 경로에서 기존 `kp-app-skill` Skill 디렉터리와 수정 내용을 확인한다. 기존 파일을 자동으로 덮어쓰지 않는다. 이미 설치된 Skill은 버전과 내용을 대조하고, 누락된 Skill만 설치한다. 업데이트가 필요한 기존 파일에 사용자 수정이 있으면 변경 사항을 보존하고 병합 전에 사용자에게 확인한다.

## 설치

먼저 원격 플러그인의 Skill 이름을 조회한다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills --list
~~~

기존 대상 Skill이 하나도 없으면 현재 에이전트에 맞는 값 하나만 선택해 플러그인의 Skill 디렉터리 전체를 프로젝트 로컬로 설치한다. `--global` 또는 `-g` 옵션은 붙이지 않는다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills --skill '*' --agent codex --copy --yes
~~~

`--agent codex`는 예시다. 현재 에이전트가 Claude Code, Hermes Agent, OpenClaw라면 각각 `claude-code`, `hermes-agent`, `openclaw`를 사용한다. 여러 에이전트를 동시에 설치하지 않는다.

기존 프로젝트 로컬 Skill이 일부 있으면 `--skill '*'`로 덮어쓰지 않는다. `--list` 결과에서 대상에 없는 Skill 이름만 골라 `--skill <skill-name>`으로 하나씩 설치한다. 경로가 이미 존재하면 파일 내용을 비교한 뒤 사용자 변경을 보존한다.

## 설치 후 확인

- 현재 플러그인 버전에 포함된 모든 Skill이 현재 에이전트의 프로젝트 로컬 경로에 있는지 확인한다.
- 각 Skill 디렉터리에 유효한 `SKILL.md`가 있고 `metadata.version`이 플러그인 버전과 맞는지 확인한다.
- `kp-app-init`은 초기화·구조 연결 작업에, `kp-app-deploy`는 사용자가 환경을 명시해 요청한 DEV 또는 PRD Firebase Hosting 배포에, `kp-app-api`는 새 KP API 기능 연동·기존 연동 수정에 연결한다.
- 별도 `biome-eslint-ide-config-skill`은 이 플러그인에 포함되지 않는다. 해당 Skill은 [agent-ide.md](agent-ide.md)의 절차에 따라 같은 대상 저장소의 프로젝트 로컬 경로에 따로 설치한다.
