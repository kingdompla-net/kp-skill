# KP 앱 Skill

버전: 2.10.0

`kp-app-skill`은 KP React 앱 초기화와 API 연동, 이미지 최적화, Firebase Hosting Preview 검토와 live 배포에 필요한 프로젝트 로컬 Skill을 제공합니다.

| Skill | 버전 | 언제 사용하나 | 역할 |
| --- | --- | --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | `2.8.2` | 설계된 React 저장소를 KP 앱으로 처음 연결할 때 | 기존 화면과 기준 도구 구성을 보존하고 호환되는 도구·Node.js 설정을 `.agents/references/spec.md`에 기록하며 Firebase Hosting target, 환경별 Preview 시스템 App ID, URL·callback·정리 상태를 추적합니다. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | `2.6.1` | 이미 초기화된 앱에 기능을 추가하거나 KP API 연동을 수정할 때 | 공식 API 계약을 확인해 기존 앱 구조와 query/state 경계에 연결합니다. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | `2.7.1` | 환경을 지정하지 않고 기본 배포를 요청했을 때 | DEV를 기본값으로 선택하고 Firebase Hosting 공통 배포 규칙을 안내합니다. |
| [`kp-app-deploy-dev`](skills/kp-app-deploy-dev/SKILL.md) | `1.0.1` | DEV 배포 Skill을 직접 호출할 때 | DEV Hosting만 검증·빌드·배포합니다. |
| [`kp-app-deploy-prd`](skills/kp-app-deploy-prd/SKILL.md) | `1.0.1` | PRD 배포 Skill을 직접 호출할 때 | PRD를 검증·빌드하고, 별도 승인을 받은 뒤에만 live 배포합니다. |
| [`kp-app-preview-release`](skills/kp-app-preview-release/SKILL.md) | `1.0.2` | 검토용 Firebase Hosting Preview Channel 배포를 요청했을 때 | 정확한 환경과 Hosting target을 검증해 만료 기간 1일의 Preview를 배포하고, 승인된 경우에만 임시 OAuth callback을 등록·검증합니다. |
| [`kp-app-preview-delete`](skills/kp-app-preview-delete/SKILL.md) | `1.0.1` | 검토 완료 또는 PR 병합 뒤 해당 Preview를 정리할 때 | 해당 배포에서 추가한 callback과 Firebase Hosting Preview Channel만 확인해 정리합니다. |
| [`kp-app-image-optimize`](skills/kp-app-image-optimize/SKILL.md) | `1.0.1` | KP 앱에서 실제 사용하는 로컬 또는 Firebase Storage 이미지의 용량 최적화를 요청할 때 | 화면 크기와 품질을 확인하고 소비 경로·다운로드 토큰·Storage metadata를 보존해 최적화합니다. |

초기화 과정에서 대상 앱 `package.json`에 `build:dev`·`deploy:dev`를 만들고, PRD 프로젝트 ID와 Hosting 사이트 ID가 확인되면 `build:prd`·`deploy:prd`도 추가합니다. `kp-app-init`은 초기화가 끝난 뒤 `kp-app-skill`의 여덟 Skill을 같은 프로젝트·에이전트 경로에 설치합니다. `kp-api-skill`은 자동 설치 대상이 아닙니다. 로컬 API key는 [`kp-credential`](../kp-credential/README.ko.md)에서 숨김 입력으로 저장하고 API 사용 범위를 승인합니다. CLI는 처음 필요할 때 설치된 Skill 폴더에서 자동 설치·갱신합니다. `AGENTS.local.md`에는 항목 라벨만 기록하며 이 도구를 임의 명령이나 브라우저 로그인 비밀번호에 사용하지 않습니다.

## 생성 저장소의 Git 규칙

각 작업 맥락은 구현과 직접 검증이 끝날 때마다 별도 커밋으로 남깁니다. 전체 검증이 끝나면 확인된 base 대상 PR을 만들고 필수 검사와 리뷰가 끝난 뒤 병합합니다. PR 없이 브랜치를 base에 직접 병합하거나 `main`/`dev`에 직접 push하려면 실행 직전에 사용자의 명시적 승인을 받아야 합니다. 커밋 전에 활성 GitHub 계정과 Git author·committer identity가 같은 계정인지 확인하고, 이메일은 그 계정에 인증된 주소 또는 GitHub noreply 주소를 사용합니다. 계정과 프로젝트 ID는 대상 저장소에서 Git 추적을 제외한 `AGENTS.local.md`에 두되 비밀값은 넣지 않습니다.

## 설치

앱 Skill 하나를 설치하거나 사용할 때도 같은 프로젝트·에이전트 범위에 `kp-skill-manager` 세 Skill과 `kp-credential` 전체 Skill이 필요합니다. Skills CLI 자체는 plugin dependency를 자동 설치하지 않지만, 설치된 앱 Skill을 실행하면 선택한 에이전트의 프로젝트 경로를 확인해 빠진 dependency Skill을 작업 전에 자동 설치합니다. 설치 전에 필요한 작업, Skill 이름과 경로를 사용자에게 알리고, 설치 후 추가한 Skill과 경로를 보고합니다. 아래 명령은 미리 설치하려는 경우에 사용하는 선택 절차입니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --copy --yes
~~~

아래 명령은 대상 저장소 루트에서 실행합니다. `npx skills add`는 현재 작업 디렉터리를 프로젝트 설치 대상으로 사용하므로 `--global` 또는 `-g`를 붙이지 않습니다.

| 에이전트 | 프로젝트 로컬 경로 | 사용자 전역 경로(`--global`/`-g`) |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |

Skills CLI는 플러그인 이름으로 디렉터리를 중첩하지 않습니다. 예를 들어 Codex에는 `.agents/skills/kp-app-init/`와 `.agents/skills/kp-app-api/`가 바로 생깁니다. `.agents/skills/kp-app-skill/kp-app-init/` 형태가 아닙니다. 다른 에이전트의 경로는 [공식 지원 에이전트 표](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)에서 확인해 주세요.

### 새 저장소 초기화

초기화 대상 저장소 루트에서 시작 Skill을 프로젝트 로컬로 설치합니다. 기존 코드베이스에서는 초기화 Skill을 사용할 필요가 없습니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill kp-app-init --agent codex --copy --yes
~~~

이 명령은 `kp-app-init` 하나를 설치합니다. 초기화 전에 해당 Skill이 필수 manager·credential 전체가 있는지 확인하고 빠진 항목을 자동 설치합니다. 초기화가 완료되면 앱 플러그인의 나머지 일곱 Skill을 같은 프로젝트·에이전트 경로에 설치합니다. `kp-api-skill`의 일곱 Skill은 설치하지 않습니다.

Codex에서 초기화가 끝난 뒤의 구성은 다음과 같습니다.

~~~text
<project>/.agents/skills/
├── kp-skill-create/
├── kp-skill-release/
├── kp-skill-install/
├── kp-credential/
├── kp-app-init/
├── kp-app-api/
├── kp-app-deploy/
├── kp-app-deploy-dev/
├── kp-app-deploy-prd/
├── kp-app-preview-release/
├── kp-app-preview-delete/
└── kp-app-image-optimize/
~~~

Claude Code에서는 `.agents/skills/` 대신 `.claude/skills/`를 사용합니다. 폴더 이름은 플러그인이 아니라 각 Skill 이름입니다.

### 기존 저장소 또는 여러 에이전트 설치

기존 프로젝트에서는 초기화를 거치지 말고 앱 Skill 전체 또는 지명한 앱 Skill을 설치할 수 있습니다. 앱 Skill을 실행할 때 필요한 manager·credential Skill이 빠져 있으면 작업 전에 자동 설치합니다. 아래 manager·credential 명령은 미리 설치하려는 경우에 사용합니다. `--agent`는 반복 옵션이며, 아래는 네 에이전트의 프로젝트 경로에 모두 복사하는 예입니다.

미리 설치하려면 대상 Skill과 같은 `--agent` 옵션을 사용합니다. 단일 앱 Skill만 설치해도 실행 시 누락된 dependency를 자동으로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

한 에이전트만 사용하려면 그 `--agent` 옵션 하나만 둡니다. 특정 Skill만 설치하려면 `--skill '*'` 대신 이름을 지정합니다. 기본 범위는 현재 프로젝트입니다. 저장소 안에만 설치하려면 `--global` 또는 `-g`를 추가하지 않습니다.

### 업데이트와 네이티브 플러그인

정본 Skill은 `kp-skill` 저장소에 있습니다. 대상 프로젝트 루트에서 `npx skills update`를 실행한 뒤 변경된 파일을 검토하고 로컬 수정을 보존합니다. Claude native plugin 설치는 `.claude-plugin/plugin.json`에 선언된 manager·credential 의존성을 사용하며, Skills CLI 복사 설치와는 별도입니다. native plugin의 설치 범위는 호스트별로 확인하고, 프로젝트 전용 설치에는 위 Skills CLI 절차를 사용합니다.

## 사용

검토용 Preview channel 생성과 callback 승인·등록은 `kp-app-preview-release`, PR 병합 또는 검토 완료 뒤 정리는 `kp-app-preview-delete`를 사용합니다.

설계 소스를 처음 연결할 때 `kp-app-init`, 기존 앱에 KP API 기능을 연결할 때 `kp-app-api`, 환경을 지정하지 않은 기본 DEV Hosting 배포는 `kp-app-deploy`를 사용합니다. 고정된 호출은 프로젝트 로컬 Skill을 직접 설치한 Claude Code에서 `/kp-app-deploy-dev` 또는 `/kp-app-deploy-prd`, Claude Code 플러그인 설치에서는 `/kp-app-skill:kp-app-deploy-dev` 또는 `/kp-app-skill:kp-app-deploy-prd`, Codex에서는 `$kp-app-deploy-dev` 또는 `$kp-app-deploy-prd`를 사용합니다. PRD는 production 빌드 뒤 실제 배포 승인을 확인합니다.
