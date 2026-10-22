---
name: kp-skill-install
description: "특정 KP 플러그인이나 Skill 또는 kp-skill 저장소의 전체 KP Skill을 실제 배포 버전으로 맞추기 위해 프로젝트·명시된 사용자 설치를 갱신할 때 사용합니다."
metadata:
  version: "1.0.0"
---

# KP Skill 설치 갱신

요청된 KP Skill의 정본 버전과 설치된 agent 파일을 비교해 지정된 범위만 갱신합니다. 파일 복사형 Skill과 agent native plugin marketplace는 서로 다른 갱신 절차를 사용합니다.

## 설치 범위 확인

1. 현재 작업 프로젝트의 루트, `AGENTS.md`, branch와 `git status --short --branch`를 확인합니다. 설치 파일이 tracked/untracked 변경인지와 기존 로컬 편집을 보존합니다.
2. `npx skills list`, `npx skills check`, 프로젝트의 Skills lock file 및 agent별 설치 경로를 확인해 source URL·ref·plugin/skill 이름·project/global scope를 찾습니다. 경로가 보이지 않는다는 이유로 미설치라 단정하지 않습니다.
3. 업데이트 대상은 다음 범위로 해석합니다.
   - “지명한 Skill”: 그 Skill의 프로젝트 설치만 갱신합니다.
   - “지명한 플러그인”: 해당 plugin README/manifest가 나열하는 Skill만 갱신합니다.
   - “전체 KP Skill”: 현재 지정된 project 또는 명시된 global scope에서 `kp-skill` 출처로 설치한 모든 KP plugin/Skill을 갱신합니다.
   - 다른 프로젝트나 무관한 agent Skills는 포함하지 않습니다. 여러 저장소 전체 갱신을 요청했지만 경로가 지정되지 않았다면 검색 범위를 정할 수 있도록 보고합니다.
4. 설치 source가 `kingdompla-net/kp-skill`이고 선택된 branch/ref가 실제 최신 release를 가리키는지 확인합니다. 이름이 같은 다른 source를 갱신하지 않습니다. source가 이전 Git tag에 고정되어 있으면 고정 ref와 최신 버전 차이를 보여드리고 임의로 ref를 바꾸지 않습니다.
5. 범위·설치 경로·예상 버전이 확인되면 그 범위에서만 진행합니다. global 사용자 경로, workspace plugin이나 설치 scope를 바꾸지 않습니다.

## KP Skill 관계표와 필수 관리자 설치

설치와 갱신을 시작하기 전에 [KP Skill 관계표와 생성·버전·네이밍 원칙](references/kp-skill-catalog-and-authoring.md)을 읽고 대상 Skill의 연결 관계, 이름과 버전 규칙을 적용합니다.

- 사용자가 `kp-skill`의 앱/API Skill을 설치해 달라고 요청했는데 현재 프로젝트의 해당 에이전트 경로에 `kp-skill-manager` Skill 전체가 없으면, manager가 함께 필요한 이유와 설치 경로를 설명하고 설치 동의를 구합니다. 동의하면 manager의 세 Skill을 먼저 프로젝트 로컬로 설치하고 검증한 뒤 요청된 플러그인/Skill을 설치합니다. 거부하면 후속 설치를 진행하지 않습니다.
- 사용자가 `kp-skill-manager` 설치를 직접 요청하면 그 요청을 manager 플러그인 전체 설치 동의로 보고, 같은 프로젝트·에이전트 범위에 설치합니다. global 설치는 사용자가 정확히 요청한 경우에만 진행합니다.
- 다른 KP Skill이 필요해지면 관계표에서 필요한 Skill과 이유를 확인합니다. 현재 프로젝트·에이전트 경로에 없으면 이름과 이유를 설명하고 추가 설치 동의를 받은 뒤 해당 Skill만 프로젝트 로컬로 설치합니다.
- `kp-skill` Skill 설치는 Skills CLI 복사 방식과 agent native plugin 방식의 의존성 처리 차이를 따릅니다. 앱/API native plugin은 `kp-skill-manager` manifest 의존성을 사용하고, Skills CLI 설치는 manager를 별도 선행 설치합니다.

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
