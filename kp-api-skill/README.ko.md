# KP API Skill

버전: 1.1.0

`kp-api-skill`은 KP Firebase Functions 저장소에서 새 코드베이스를 준비하고, 필요한 HTTP endpoint와 비동기 worker를 구현·검증·배포하는 프로젝트 로컬 Skill 묶음입니다. 처음 API 저장소를 만드는 경우와 기존 KP API 저장소에 합류하는 경우 모두 사용할 수 있습니다.

| Skill | 버전 | 언제 사용하나 | 역할 |
| --- | --- | --- | --- |
| [`kp-api-init`](skills/kp-api-init/SKILL.md) | `1.0.1` | 새 Firebase Functions 코드베이스와 도메인 router를 처음 만들 때 | 기존 저장소의 Firebase 설정을 조사해 코드베이스·router·개발 지침·환경별 npm script를 준비합니다. |
| [`kp-api-endpoint`](skills/kp-api-endpoint/SKILL.md) | `1.0.1` | 기존 router에 동기 HTTP endpoint를 추가하거나 수정할 때 | 인증, 입력 schema, 권한, 오류 응답, 테스트를 기존 패턴에 맞춰 구현합니다. |
| [`kp-api-worker`](skills/kp-api-worker/SKILL.md) | `1.0.1` | 요청 시간이 길거나 지연·재시도가 필요한 비동기 작업이 있을 때 | Cloud Tasks 또는 Scheduler 기반 worker를 설계하고 중복·재시도·동시성 경계를 검증합니다. |
| [`kp-api-test-deploy`](skills/kp-api-test-deploy/SKILL.md) | `1.0.1` | DEV·PRD와 분리된 로컬 emulator 또는 승인된 전용 test project에서 검증할 때 | Unit test와 emulator를 우선하고, 격리된 project에서만 제한된 원격 테스트 배포를 수행합니다. |
| [`kp-api-build`](skills/kp-api-build/SKILL.md) | `1.0.1` | 도메인 API를 요청받아 필요한 endpoint와 worker를 끝까지 만들 때 | 저장소 상태를 읽고 `init`·`endpoint`·`worker`·테스트를 필요한 만큼 조합하는 진입 Skill입니다. |
| [`kp-api-deploy`](skills/kp-api-deploy/SKILL.md) | `1.0.1` | 사용자가 DEV 또는 PRD 배포를 명시했을 때 | 테스트 결과와 Firebase project, function 범위, 인증 주체와 권한을 확인하고 선택한 함수만 배포합니다. |
| [`kp-api-docs`](skills/kp-api-docs/SKILL.md) | `1.0.1` | 실제 배포된 공개 API를 Developer Center 문서에 반영할 때 | 로컬 Center 저장소에 공개 contract만 기록하고 1일 Preview와 임시 callback을 정리합니다. |

## 구조 선택 기준

도메인당 Firebase Functions codebase와 HTTP router를 처음 한 번 준비합니다. 이후 동기 요청 경로는 기존 router에 endpoint handler를 추가합니다. 독립 실행, 시간이 긴 작업, 큐 기반 재시도나 정기 실행이 필요한 기능만 worker로 분리합니다. 매 endpoint마다 새 Firebase codebase나 Cloud Function을 만들지 않습니다. HTTP API와 비동기 처리의 계약·권한·수명 주기가 실제로 다를 때만 분리합니다.

QT 구현은 참고 패턴이지 복사할 템플릿이 아닙니다. 새 프로젝트의 database, API key, runtime service account, queue, region, secret, project ID를 QT 저장소에서 가져오지 않습니다. 전체 codebase에서 확인한 구조와 사례별 예외는 [API 저장소 패턴 분석](skills/kp-api-init/references/api-project-architecture.md)에 정리했습니다.

## Developer Center API Docs

배포가 확인된 공개 API 계약은 [`kp-api-docs`](skills/kp-api-docs/SKILL.md)를 사용해 로컬 `kingdom-planet-center` 저장소에 반영합니다. DEV 문서는 [Developer Center DEV](https://developer-kpcenter-dev.web.app/api/)에, PRD 문서는 [Developer Center PRD](https://developer-kpcenter.web.app/api)에 배포합니다. worker, 관리자 기능, 내부 server-to-server 작업 API는 공개 문서에 자동으로 포함하지 않습니다.

실제 사이트에 바로 배포하지 않고 먼저 DEV Hosting Preview Channel에서 검토합니다. Preview는 1일 만료로 만들며, 로그인 검증에 임시 OAuth callback이 필요하면 추가 URL과 대상 앱 설정을 사용자에게 먼저 보여드리고 승인받습니다. 검토가 끝나면 임시 callback과 이번 작업의 Preview Channel을 정리합니다. 최종 DEV·PRD 배포는 사용자의 별도 승인을 거친 뒤 해당 API 환경에 맞춰 진행합니다.

## 새 코드베이스 초기화

API Skill 하나를 설치하거나 사용할 때도 같은 프로젝트·에이전트 범위에 `kp-skill-manager` 세 Skill과 `kp-credential` 전체 Skill이 필요합니다. Skills CLI 자체는 plugin dependency를 자동 설치하지 않지만, 설치된 API Skill을 실행하면 선택한 에이전트의 프로젝트 경로를 확인해 빠진 dependency Skill을 작업 전에 자동 설치합니다. 설치 전에 필요한 작업, Skill 이름과 경로를 사용자에게 알리고, 설치 후 추가한 Skill과 경로를 보고합니다. 아래 명령은 미리 설치하려는 경우에 사용하는 선택 절차입니다.

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

Skills CLI는 플러그인 이름으로 디렉터리를 중첩하지 않습니다. Codex에는 `.agents/skills/kp-api-init/`처럼 Skill별 디렉터리를 바로 만들며, `.agents/skills/kp-api-skill/kp-api-init/` 형태가 아닙니다. 다른 에이전트 경로는 [공식 지원 에이전트 표](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)를 확인해 주세요.

초기화 대상 저장소 루트에서 시작 Skill을 프로젝트 로컬로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill kp-api-init --agent codex --copy --yes
~~~

이 명령은 `kp-api-init` 하나를 설치합니다. 초기화 전에 해당 Skill이 필수 manager·credential 전체가 있는지 확인하고 빠진 항목을 자동 설치합니다. 초기화가 끝나면 `kp-api-skill`의 다른 여섯 Skill을 같은 프로젝트·에이전트 경로에 설치합니다. `kp-app-skill`은 자동 설치 대상이 아닙니다. 설치 경로 예시는 다음과 같습니다.

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

Claude Code에서는 `.agents/skills/` 대신 `.claude/skills/`를 사용합니다. 초기 router는 `$kp-api-test-deploy`로 먼저 검증합니다. 실제 DEV 또는 PRD 배포는 사용자가 환경과 배포 범위를 명시한 경우에만 `$kp-api-deploy` 절차를 따릅니다.

## 기존 API 저장소에 설치

`kp-api-init`을 실행할 필요 없이 API Skill 전체 또는 지명한 단일 API Skill을 설치할 수 있습니다. API Skill을 실행할 때 manager·credential Skill이 빠져 있으면 작업 전에 자동 설치합니다. 아래 manager·credential 명령은 미리 설치하려는 경우에 사용합니다. 아래 예시는 네 에이전트의 프로젝트 로컬 경로에 복사하며 사용하지 않는 `--agent` 옵션은 지웁니다.

미리 설치하려면 대상 Skill과 같은 `--agent` 옵션을 사용합니다. 단일 API Skill만 설치해도 실행 시 누락된 dependency를 자동으로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

한 에이전트만 사용하려면 해당 `--agent` 옵션만 둡니다. 특정 API Skill만 설치하려면 `--skill '*'` 대신 이름을 지정합니다. 설치 기본 범위는 현재 프로젝트입니다. 저장소 안에서만 사용하려면 `--global`이나 `-g`를 추가하지 않습니다. 정본은 `kp-skill`의 `kp-api-skill/skills/`이며, 업데이트 후에는 `npx skills update`를 실행하고 기존 로컬 수정과 diff를 확인합니다.

Claude native plugin 설치는 `.claude-plugin/plugin.json`에 선언된 manager·credential 의존성을 사용하며, Skills CLI 복사 설치와는 별도입니다. native plugin의 설치 범위는 호스트별로 확인하고 프로젝트 전용 설치에는 위 Skills CLI 절차를 사용합니다.

## 계정·권한·비밀 정보

초기화는 실제 계정 비밀번호나 API key를 생성·수집하지 않습니다. 프로젝트의 `.gitignore`가 `AGENTS.local.md`를 제외하도록 하고, 로컬 설정에는 계정 이메일, DEV·PRD project ID, 인증 주체, 권한 오류에서 관측된 범위, 비밀 항목 라벨만 둡니다. 로컬 API 요청에서는 [`kp-credential`](../kp-credential/README.ko.md)의 CLI가 처음 필요할 때 설치된 Skill 폴더에서 자동 설치·갱신됩니다. 사용자는 숨김 입력으로 값을 저장하고 origin·경로·method 범위를 승인합니다. 에이전트는 `kp-credential request <항목이름> --url <HTTPS_URL>`로 요청하며 CLI는 저장된 값을 직접 반환하지 않고 응답에서 원문과 흔한 encoding을 지웁니다. API가 credential을 임의로 변환해 응답하면 감지할 수 없으므로 해당 endpoint에 권한을 부여하지 않습니다. Firebase runtime secret은 Google Cloud Secret Manager에 둡니다. 이 도구는 임의 CLI의 환경 변수 주입이나 브라우저 로그인 입력을 지원하지 않습니다.

Google Workspace 계정이 있다는 것만으로 Cloud Functions 배포 권한이 생기지는 않습니다. 실제 403의 principal, project, 대상 함수·codebase, region, 거부된 permission을 확인해 프로젝트 관리자에게 최소 권한을 요청하도록 안내합니다. 역할을 추측하거나 `Owner`/`Editor`를 기본 요청하지 않습니다. 권한 모델과 수동 관리자 요청 양식은 [`kp-api-deploy` 접근 지침](skills/kp-api-deploy/references/access-and-secrets.md)에 있습니다.

개발·빌드·테스트에는 배포 권한을 제공하지 않는 환경을 기본으로 권장합니다. 가장 안전한 배포 경계는 agent가 credential을 직접 읽지 않는 제한형 배포 broker 또는 보호된 CI runner이며, DEV와 PRD의 identity를 분리하고 PRD 실행을 사람 승인으로 보호합니다. 권장 설계와 제한은 접근 지침에서 확인합니다.

모든 새 한국어 문서는 존댓말로 작성합니다. Skill에서 생성하거나 수정하는 프로젝트 문서와 `AGENTS.md`에도 같은 문체를 적용합니다.
