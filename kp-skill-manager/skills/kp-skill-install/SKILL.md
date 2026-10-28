---
name: kp-skill-install
description: "특정 KP 플러그인이나 Skill 또는 kp-skill 저장소의 전체 KP Skill을 실제 배포 버전으로 맞추기 위해 프로젝트·명시된 사용자 설치를 갱신할 때 사용합니다."
metadata:
  version: "1.2.0"
---

# KP Skill 설치 갱신

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

요청된 KP Skill의 정본 버전과 설치된 agent 파일을 비교해 지정된 범위만 갱신합니다. 파일 복사형 Skill과 agent native plugin marketplace는 서로 다른 갱신 절차를 사용합니다.

## 설치 범위 확인

1. 현재 작업 프로젝트의 루트, `AGENTS.md`, branch와 `git status --short --branch`를 확인합니다. 설치 파일이 tracked/untracked 변경인지와 기존 로컬 편집을 보존합니다.
2. Skills CLI의 복사 설치는 에이전트 Skill 디렉터리 바로 아래에 `<skill-name>/`을 만듭니다. Codex는 `<project>/.agents/skills/`, Claude Code는 `<project>/.claude/skills/`를 사용하며 plugin 이름의 상위 폴더를 만들지 않습니다. `npx skills add`는 현재 작업 디렉터리를 프로젝트 대상으로 사용하고, `--global`/`-g`만 사용자 범위로 전환합니다. 정확한 경로는 [공식 지원 에이전트 표](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)를 확인합니다.
3. `npx skills list`, `npx skills check`, 프로젝트의 Skills lock file 및 agent별 설치 경로를 확인해 source URL·ref·plugin/skill 이름·project/global scope를 찾습니다. 경로가 보이지 않는다는 이유로 미설치라 단정하지 않습니다.
4. 업데이트 대상은 다음 범위로 해석합니다.
   - “지명한 Skill”: 그 Skill의 프로젝트 설치만 갱신합니다.
   - “지명한 플러그인”: 해당 plugin README/manifest가 나열하는 Skill만 갱신합니다.
   - “전체 KP Skill”: 현재 지정된 project 또는 명시된 global scope에서 `kp-skill` 출처로 설치한 모든 KP plugin/Skill을 갱신합니다.
   - 다른 프로젝트나 무관한 agent Skills는 포함하지 않습니다. 여러 저장소 전체 갱신을 요청했지만 경로가 지정되지 않았다면 검색 범위를 정할 수 있도록 보고합니다.
5. 설치 source가 `kingdompla-net/kp-skill`이고 선택된 branch/ref가 실제 최신 release를 가리키는지 확인합니다. 이름이 같은 다른 source를 갱신하지 않습니다. source가 이전 Git tag에 고정되어 있으면 고정 ref와 최신 버전 차이를 보여드리고 임의로 ref를 바꾸지 않습니다.
6. 범위·설치 경로·예상 버전이 확인되면 그 범위에서만 진행합니다. global 사용자 경로, workspace plugin이나 설치 scope를 바꾸지 않습니다.

## 프로젝트 공통 참조 준비

KP Skill을 프로젝트에 설치할 때 `kp-skill-manager`의 공통 설정·자격 증명 reference를 프로젝트 로컬에 준비합니다.

1. manager의 `references/credential-and-local-config.md`를 `<project>/.agents/references/credential-and-local-config.md`로 복사합니다. 대상 파일이나 프로젝트 폴더가 없으면 만들고, 사용자가 이미 만든 동일 경로의 파일은 덮어쓰지 않습니다.
2. 프로젝트 루트 `AGENTS.md`에서 `.agents/references/credential-and-local-config.md`를 읽도록 라우팅합니다. 기존 `AGENTS.md`가 있으면 필요한 링크만 추가해 보존합니다. 파일이 없으면 이 라우팅 규칙만 포함한 간단한 `AGENTS.md`를 만듭니다.
3. `AGENTS.local.md`는 비밀이 아닌 값이 실제로 필요할 때만 준비합니다. 없으면 manager의 `assets/templates/AGENTS.local.md`를 프로젝트 루트에 복사하고, 앱·API 초기화 중이면 해당 plugin의 상세 template을 사용합니다. 기존 파일은 덮어쓰지 말고 필요한 섹션만 병합합니다.
4. 사용자 값을 요청할 때는 저장소 설정을 먼저 확인하고 누락된 비밀 아닌 값만 대화로 받습니다. 값은 원본 asset이 아니라 프로젝트 루트의 `AGENTS.local.md` 복사본에서 알맞은 위치에 설정합니다. 파일이 Git에서 추적되지 않고 무시되는지 확인합니다.

## KP Skill 관계표와 필수 플러그인 자동 설치

설치와 갱신을 시작하기 전에 [KP Skill 관계표와 생성·버전·네이밍 원칙](references/kp-skill-catalog-and-authoring.md)을 읽고 대상 Skill의 연결 관계, 이름과 버전 규칙을 적용합니다.

- 현재 실행 중인 Skill을 수행하는 데 `kp-skill-manager`의 Skill이 필요하지만 전체 manager 세트가 없으면, 설치 이유·필요한 Skill·프로젝트와 agent 경로를 사용자에게 먼저 알린 뒤 manager 전체를 자동 설치하고 검증합니다. 별도 동의를 묻지 않습니다.
- 작업에 `kp-credential`의 Skill이 필요하지만 credential 전체가 없으면 manager 전체가 있는지 먼저 확인하고, 빠진 manager 전체와 credential 전체를 같은 프로젝트·agent 범위에 자동 설치합니다. 앱/API Skill을 설치하거나 사용하는 작업은 항상 두 dependency 전체를 확인합니다. 설치 후 추가한 Skill 이름과 실제 경로를 알린 다음 요청 작업을 계속합니다.
- `kp-credential` Skill이 dependency로 설치되는 즉시, 같은 설치 작업 안에서 설치된 Skill의 `scripts/install-global.mjs`를 실행해 CLI package를 현재 OS 사용자의 npm 전역 환경에 설치·갱신합니다. Skills CLI는 Skill 파일을 복사할 뿐 npm package를 설치하지 않으므로 helper가 package 설치, OS 사용자 PATH 설정과 `kp-credential --version` 및 일반 명령 탐색을 처리합니다. Skill 파일은 프로젝트 로컬에 두고 CLI만 OS 사용자 범위에 둡니다.
- 앱/API native plugin은 manifest에서 manager와 credential plugin을 모두 의존성으로 선언합니다. Skills CLI 복사 설치는 dependency를 자동 처리하지 않으므로 같은 agent의 프로젝트 경로에 없는 Skill만 전체 dependency 순서대로 설치합니다. 기존 파일과 사용자의 수정은 덮어쓰지 않습니다.
- 사용자가 `kp-credential` 설치를 요청하면 manager·credential Skill 파일은 프로젝트 로컬로 설치하고 CLI package는 OS 사용자 환경에 설치합니다. `kp-skill-manager`만 요청하면 manager 전체만 설치합니다. `--global`/`-g` Skill 설치는 사용자가 정확히 요청한 경우에만 진행합니다.
- 다른 KP Skill이 필요해지면 관계표에서 필요한 Skill과 이유를 확인합니다. manager·credential dependency 이외의 선택 Skill은 현재 경로에 없을 때 이름과 이유를 설명하고 별도 동의를 받은 뒤 프로젝트 로컬로 설치합니다.
- `kp-skill` Skill 설치는 Skills CLI 복사 방식과 agent native plugin 방식의 dependency 처리 차이를 따릅니다. 앱/API native plugin은 `kp-skill-manager`와 `kp-credential` 의존성을 모두 사용하고, Skills CLI 경로는 필요한 전체 Skill 세트를 프로젝트 로컬에 자동 설치합니다.

## Skills CLI 설치 갱신

프로젝트 로컬 설치에서는 대상 프로젝트 루트에서 먼저 다음 확인 명령을 실행합니다.

~~~bash
npx skills list
npx skills check
~~~

출처가 확인된 KP Skill만 선택해 갱신합니다. 모든 KP Skill이라도 다른 source의 동일 이름 Skill을 포함하지 않도록 lock 정보와 결과 diff를 검사합니다.
한 플러그인만 갱신할 때는 해당 README와 manifest에서 Skill 이름을 확인해 모두 지정합니다. KP 전체를 갱신할 때는 저장소 marketplace에 등록된 각 플러그인의 Skill 목록을 확인해 대상 이름을 구성합니다.

~~~bash
npx skills update kp-api-endpoint kp-api-worker --project --yes
~~~

명시적으로 global 설치 갱신을 요청한 경우에만 동일한 대상 Skill 이름을 사용해 `--global` 범위를 지정합니다. Skills CLI의 기본 project/global scope와 옵션은 [marketplace와 로컬 설치 갱신 안내](references/marketplace-updates.md)를 참조합니다.

## Agent native marketplace 갱신

Claude Code, Codex 또는 조직 관리형 workspace marketplace에서 설치한 plugin은 해당 agent의 marketplace를 먼저 확인한 뒤 그 agent가 지원하는 갱신 방법을 사용합니다. 파일 기반 Skills CLI 명령으로 native plugin 설치 상태가 같이 바뀐다고 가정하지 않습니다.

상세 명령과 버전 감지 차이는 [marketplace와 로컬 설치 갱신 안내](references/marketplace-updates.md)를 읽습니다. 업데이트 후 새 세션이나 plugin reload가 필요한 agent에서는 현재 세션이 자동으로 새 Skill을 읽었다고 보고하지 않습니다.

## 설치 결과 검증

- 갱신 전후 `SKILL.md`와 설치 manifest의 실제 버전을 비교합니다.
- 변경된 파일을 대상 경로별로 확인합니다. 로컬 수정이 있거나 자동 병합에서 충돌이 나면 덮어쓰지 말고 사용자 변경을 보존해 검토 가능한 상태로 멈춥니다.
- 프로젝트 범위의 설치가 요청되었는데 user/global 설정이 변경되면 원인을 확인하고 해당 설정을 되돌려도 되는지 사용자의 승인을 받습니다.
- workspace 관리자 동작이 필요한 marketplace는 local CLI 결과로 완료를 주장하지 말고 관리자 갱신이 필요한 상태를 보고합니다.
- 완료 보고에는 요청된 project/global 범위, 각 agent의 설치 방식, 이전·이후 Skill 버전, provider refresh/reload 여부와 남은 작업을 구분합니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | 업무 API | 호출하지 않습니다. Native marketplace 설치·갱신은 agent/provider의 관리 기능으로 처리합니다. | — |
| CLI | Skills CLI: 범위 확인 | `npx skills list`와 `npx skills check`로 설치 상태를 확인합니다. | [Skills CLI commands](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) |
| CLI | Skills CLI: 설치·갱신 | 설치는 `npx skills add <SOURCE_URL> --skill <SKILL_NAME> --agent <AGENT> --copy --yes`, project update는 `npx skills update <SKILL_NAME> --project --yes`입니다. global update는 명시적 요청이 있을 때만 `--global`을 사용합니다. 여러 Skill은 `--skill` 뒤에 이름을 추가합니다. | [Skills CLI commands](https://github.com/vercel-labs/skills/blob/main/docs/commands.md), [지원 agent](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) |
| 기타 | Lock file·agent Skill 경로·manifest·marketplace catalog | 설치 결과를 대조합니다. Native plugin 갱신은 해당 agent 절차로 별도 확인합니다. | — |

## 프로젝트 로컬 경로

이 Skill은 Codex에서 `<project>/.agents/skills/kp-skill-install/SKILL.md`, Claude Code에서 `<project>/.claude/skills/kp-skill-install/SKILL.md`에 설치됩니다. plugin 이름의 상위 폴더는 만들지 않습니다. manager 전체를 처음 설치하는 명령은 [플러그인 안내](../../README.ko.md)를 확인합니다.
