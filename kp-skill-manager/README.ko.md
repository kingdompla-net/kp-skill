# KP Skill Manager

버전: 1.1.0

`kp-skill-manager`는 이 저장소의 플러그인과 Skill을 생성하고, SemVer와 Git 태그로 버전을 관리하며, 승인된 변경을 배포하고, 지정된 프로젝트의 로컬 Skill 설치를 갱신합니다.

`kp-skill-manager`는 모든 KP Skill의 필수 동반 플러그인입니다. `kp-app-skill`이나 `kp-api-skill`에서 Skill 하나를 설치할 때는 manager의 세 Skill과 `kp-credential` 전체 Skill을 같은 프로젝트·에이전트 범위에 함께 설치합니다. 관계와 설치 흐름은 [KP Skill 관계표와 생성·버전·네이밍 원칙](skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md)을 따릅니다.

| Skill | 버전 | 언제 사용하나 | 역할 |
| --- | --- | --- | --- |
| [`kp-skill-create`](skills/kp-skill-create/SKILL.md) | `1.1.0` | 프로젝트에 Skill 초안을 만들거나 명시적으로 정본 승격을 요청할 때 | 공통 Skill 템플릿과 플러그인 README 기준에 맞춰 작성하고, 관리자·기여자 계정에 맞는 PR 경로를 따릅니다. |
| [`kp-skill-release`](skills/kp-skill-release/SKILL.md) | `1.0.2` | Skill 개선 배포, 버전 이력 조회 또는 이전 버전 콘텐츠를 새 버전으로 재발행할 때 | 변경 영향에 따라 버전을 올리고 manifest·README·태그를 맞춘 뒤 계정에 따른 PR·병합 경로를 따릅니다. |
| [`kp-skill-install`](skills/kp-skill-install/SKILL.md) | `1.1.0` | 현재 저장소나 지정된 사용자 범위의 KP Skill 설치를 최신 배포 버전에 맞출 때 | 설치 출처와 범위를 확인하고 필요한 manager·credential Skill을 프로젝트 로컬로 자동 설치해 실제 경로를 검증합니다. |

## 프로젝트 로컬 설치

manager Skill을 사용할 때는 manager 세 Skill 전체가 같은 프로젝트·에이전트 경로에 필요합니다. 앱/API Skill이나 credential Skill에는 credential 전체도 필요합니다. Skills CLI 복사 설치는 dependency를 자동 해석하지 않으므로, 실행 중인 Skill이 선택된 프로젝트·에이전트 경로를 확인해 빠진 전체 세트를 작업 전에 자동 설치합니다. 설치 전에는 필요한 작업, Skill 이름과 경로를 사용자에게 알리고 설치 후 추가 항목과 경로를 보고합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
~~~

credential 전체를 미리 설치하려면 위 manager 명령과 같은 agent 옵션으로 다음 명령을 실행합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --copy --yes
~~~

`npx skills add`는 현재 작업 디렉터리를 프로젝트 설치 대상으로 사용합니다. Codex나 Claude Code에서 저장소에만 설치하려면 프로젝트 루트에서 실행하고 `--global`/`-g`를 사용하지 않습니다.

| 에이전트 | 프로젝트 로컬 경로 | 사용자 전역 경로(`--global`/`-g`) |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |

Codex 프로젝트에 manager를 설치하면 `.agents/skills/kp-skill-create/`, `.agents/skills/kp-skill-release/`, `.agents/skills/kp-skill-install/`이 만들어집니다. Claude Code에서는 같은 이름의 폴더가 `.claude/skills/` 바로 아래에 생깁니다. 플러그인 이름을 감싸는 상위 폴더는 만들지 않습니다. 다른 에이전트는 [공식 지원 에이전트 표](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)에서 프로젝트 경로를 확인해 주세요.

Skills CLI 복사 설치는 plugin 의존성을 자동으로 설치하지 않습니다. 앱·API Skill을 실행하면 누락된 manager와 credential 전체 Skill을 작업 전에 사용자에게 알리고 프로젝트 로컬로 자동 설치합니다. Claude native plugin은 앱/API manifest에 선언된 두 의존성을 따릅니다. 사용자 전역 설치는 사용자가 해당 범위를 명시한 경우에만 선택합니다.

## 버전과 배포 기준

각 Skill의 버전 정본은 `SKILL.md`의 `metadata.version`입니다. 플러그인 버전은 플러그인 manifest에 두며, 해당 플러그인 README와 저장소 marketplace 목록에 같은 값을 기록합니다. Skill별 README 표에는 각 Skill의 정본 버전을 표시합니다. 영향에 따른 자동 SemVer 선택과 태그 이름은 [버전·릴리스·이전 콘텐츠 재발행 기준](skills/kp-skill-release/references/versioning-and-rollback.md)을 따릅니다.

GitHub 태그만 만들었다고 모든 에이전트의 marketplace나 설치 파일이 바뀌지는 않습니다. 설치 출처, 추적 ref, 플러그인 버전 메타데이터와 각 에이전트의 갱신 절차를 구분해야 합니다. 제공자별 차이는 [marketplace와 로컬 설치 갱신 안내](skills/kp-skill-install/references/marketplace-updates.md)에 정리했습니다.

## 계정과 PR

릴리스 전에 활성 GitHub 계정과 Git author·committer가 일치하는지 확인합니다. 로그인 계정이 kp-skill 관리자([bwlee-dix](https://github.com/bwlee-dix))이면 로컬 정본 저장소에서 `main`을 최신화하고 PR을 만든 뒤 필수 검사가 통과하면 추가 승인을 기다리지 않고 병합합니다. 리뷰 승인만 차단 조건인 경우에만 관리자 우회를 사용하며 실패한 검사는 우회하지 않습니다. 다른 계정은 fork를 로컬에 가져와 upstream 대상 PR을 만들고 관리자의 실제 병합을 기다립니다. 두 경로 모두 기본 branch에 직접 push하지 않습니다. tag·GitHub Release·marketplace 게시에는 사용자의 명시적인 릴리스 요청이 필요합니다.

## 사용 순서

- 새 플러그인과 기본 Skill을 함께 구성하거나 플러그인에 Skill을 추가할 때는 `kp-skill-create`를 사용해 주세요.
- 특정 Skill의 개선·버전업·배포, 이력 조회 또는 이전 버전 콘텐츠의 새 버전 재발행에는 `kp-skill-release`를 사용해 주세요.
- 대상 프로젝트나 지정된 global scope에 이미 설치된 KP Skill을 갱신할 때는 `kp-skill-install`을 사용해 주세요.

설치 기본 범위는 현재 프로젝트입니다. 전역 Skill 경로나 무관한 Skill까지 변경하려면 사용자가 정확한 범위를 지정한 경우에만 진행합니다.
