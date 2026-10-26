# KP 앱 플러그인 Skill 프로젝트 로컬 설치

초기화가 끝나면 이 문서에 따라 `kp-app-skill`의 누락된 Skill만 초기화 대상 저장소의 현재 에이전트용 프로젝트 경로에 설치합니다. `kp-app-init`은 API 플러그인이나 다른 KP 플러그인의 Skill을 설치하지 않습니다. 기존 앱 저장소에서도 초기화 없이 전체 앱 Skill 묶음을 프로젝트 로컬로 직접 설치할 수 있습니다.

## 설치 전 확인

1. 현재 작업 디렉터리가 초기화 대상 저장소의 루트인지 확인합니다.
2. 설치 대상 에이전트를 확인합니다. `npx skills add`는 명령을 실행한 저장소를 기본 프로젝트 범위로 사용합니다. Codex는 `.agents/skills/`, Claude Code는 `.claude/skills/`를 사용합니다. 사용자 전역 설치에는 `--global` 또는 `-g`가 필요하므로 명시적 요청 없이 사용하지 않습니다. 다른 에이전트 경로는 [Skills CLI 에이전트 안내](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)를 확인합니다.
3. 원격 `kp-app-skill` 플러그인의 버전이 plugin manifest, marketplace와 README에 일치하는지 확인합니다. 현재 실행 중인 `kp-app-init`과 설치 대상 Skill은 각각 해당 README 표의 개별 버전과 `metadata.version`을 대조합니다. 정본 파일이 같은 원격 참조에 속하는지 확인할 수 없으면 버전을 섞어 설치하지 말고 일치하는 원격 참조를 확보합니다.
4. 대상 에이전트 경로에서 기존 `kp-app-skill` Skill 디렉터리와 수정 내용을 확인합니다. 기존 파일을 자동으로 덮어쓰지 않습니다. 이미 설치된 Skill은 버전과 내용을 대조하고, 누락된 Skill만 설치합니다. 업데이트가 필요한 기존 파일에 사용자 수정이 있으면 변경 사항을 보존하고 병합 전에 사용자에게 확인합니다.

## 필수 관리자 Skill

KP Skill을 하나라도 프로젝트에 설치할 때는 `kp-skill-manager` 플러그인의 Skill 전체도 같은 프로젝트와 에이전트 경로에 있어야 합니다. 없는 경우 manager가 Skill 생성·릴리스·설치 갱신과 관계표를 제공한다는 점을 사용자에게 설명하고, 설치 동의를 받은 뒤에만 먼저 설치합니다. 사용자가 거부하면 앱 Skill 설치를 진행하지 않습니다. `--yes`는 동의를 받은 뒤에만 사용합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills --skill '*' --agent codex --copy --yes
~~~

Skills CLI는 플러그인 이름으로 디렉터리를 중첩하지 않습니다. 각 Skill은 `<agent-project-skill-dir>/<skill-name>/` 아래에 직접 놓입니다. 예를 들어 Codex에서는 `.agents/skills/kp-app-init/`, Claude Code에서는 `.claude/skills/kp-app-init/`입니다.

## 새 저장소 초기화

manager 전체가 같은 프로젝트·에이전트 경로에 설치되어 있는지 먼저 확인합니다. 빠져 있으면 설치 이유와 경로를 설명하고 동의를 받은 뒤 manager 전체를 먼저 설치합니다. 대상 저장소 루트에서 초기화 진입 Skill 하나를 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill kp-app-init --agent codex --copy --yes
~~~

이 명령은 `kp-app-init`만 설치합니다. 초기화가 끝난 뒤 기존 `kp-app-api`, `kp-app-deploy`, `kp-app-deploy-dev`, `kp-app-deploy-prd`, `kp-app-preview-release`, `kp-app-preview-delete`, `kp-app-image-optimize` 파일·버전·사용자 수정을 확인하고, 없는 Skill만 설치합니다. 일곱 Skill이 모두 없다면 다음처럼 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill kp-app-api kp-app-deploy kp-app-deploy-dev kp-app-deploy-prd kp-app-preview-release kp-app-preview-delete kp-app-image-optimize --agent codex --copy --yes
~~~

기존 Skill을 자동으로 덮어쓰지 않습니다. 로컬 수정이 있으면 보존해 병합하고 결과를 확인합니다. 설치가 끝난 Codex 경로는 다음과 같습니다.

~~~text
<project>/.agents/skills/
├── kp-skill-create/
├── kp-skill-release/
├── kp-skill-install/
├── kp-app-init/
├── kp-app-api/
├── kp-app-deploy/
├── kp-app-deploy-dev/
├── kp-app-deploy-prd/
├── kp-app-preview-release/
├── kp-app-preview-delete/
└── kp-app-image-optimize/
~~~

Claude Code에서는 같은 Skill 이름의 폴더가 `.claude/skills/` 바로 아래에 놓입니다. plugin 이름을 위한 상위 폴더는 없습니다.

## 기존 저장소에 설치

초기화가 필요하지 않으면 manager 전체가 설치된 뒤 앱 플러그인의 Skill 전체를 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' --agent codex --copy --yes
~~~

여러 에이전트 경로에 설치하려면 `--agent`를 반복합니다. manager와 앱 명령 모두 같은 에이전트 목록을 사용합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

`npx skills`의 기본 범위는 현재 프로젝트이므로 `--global`이나 `-g`를 추가하지 않습니다. 설치 전에 기존 Skill을 비교하고 로컬 수정이 있으면 자동으로 덮어쓰지 말고 변경을 보존해 병합합니다. 기존 코드베이스에는 `kp-app-init` 없이도 전체 플러그인을 설치할 수 있습니다. `kp-api-skill`은 이 설치 절차에 포함되지 않습니다.

## 설치 후 확인

- `kp-skill-manager` 세 Skill과 현재 앱 플러그인 버전의 모든 Skill이 현재 에이전트의 프로젝트 로컬 경로에 있는지 확인합니다.
- 각 Skill 디렉터리에 유효한 `SKILL.md`가 있고 `metadata.version`이 플러그인 README의 개별 버전과 맞는지 확인합니다. Plugin version은 개별 Skill 버전과 별도로 관리합니다.
- `kp-app-init`은 초기화·구조 연결 작업에, `kp-app-api`는 새 KP API 기능 연동·기존 연동 수정에, 환경을 지정하지 않은 `kp-app-deploy`는 기본 DEV 배포에 연결합니다. DEV·PRD를 고정해 호출하는 Claude Code 프로젝트 Skill은 각각 `/kp-app-deploy-dev`, `/kp-app-deploy-prd`이며, 플러그인 설치에서는 `/kp-app-skill:kp-app-deploy-dev`, `/kp-app-skill:kp-app-deploy-prd`를 사용합니다. Codex에서는 `$kp-app-deploy-dev`, `$kp-app-deploy-prd`를 선택합니다. `kp-app-preview-release`는 검토용 Preview Channel 배포에, `kp-app-preview-delete`는 검토 완료 또는 PR 병합 뒤 해당 Preview 정리에 연결합니다.
- 별도 `biome-eslint-ide-config-skill`은 이 플러그인에 포함되지 않습니다. 해당 Skill은 [agent-ide.md](agent-ide.md)의 절차에 따라 같은 대상 저장소의 프로젝트 로컬 경로에 따로 설치합니다.
