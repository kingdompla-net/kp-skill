# KP API Skill

버전: 1.0.0

`kp-api-skill`은 KP Firebase Functions 저장소에서 새 코드베이스를 준비하고, 필요한 HTTP endpoint와 비동기 worker를 구현·검증·배포하는 프로젝트 로컬 Skill 묶음입니다. 처음 API 저장소를 만드는 경우와 기존 KP API 저장소에 합류하는 경우 모두 사용할 수 있습니다.

| Skill | 버전 | 언제 사용하나 | 역할 |
| --- | --- | --- | --- |
| [`kp-api-init`](skills/kp-api-init/SKILL.md) | `1.0.0` | 새 Firebase Functions 코드베이스와 도메인 router를 처음 만들 때 | 기존 저장소의 Firebase 설정을 조사해 코드베이스·router·개발 지침·환경별 npm script를 준비합니다. |
| [`kp-api-endpoint`](skills/kp-api-endpoint/SKILL.md) | `1.0.0` | 기존 router에 동기 HTTP endpoint를 추가하거나 수정할 때 | 인증, 입력 schema, 권한, 오류 응답, 테스트를 기존 패턴에 맞춰 구현합니다. |
| [`kp-api-worker`](skills/kp-api-worker/SKILL.md) | `1.0.0` | 요청 시간이 길거나 지연·재시도가 필요한 비동기 작업이 있을 때 | Cloud Tasks 또는 Scheduler 기반 worker를 설계하고 중복·재시도·동시성 경계를 검증합니다. |
| [`kp-api-test-deploy`](skills/kp-api-test-deploy/SKILL.md) | `1.0.0` | DEV·PRD와 분리된 로컬 emulator 또는 승인된 전용 test project에서 검증할 때 | Unit test와 emulator를 우선하고, 격리된 project에서만 제한된 원격 테스트 배포를 수행합니다. |
| [`kp-api-build`](skills/kp-api-build/SKILL.md) | `1.0.0` | 도메인 API를 요청받아 필요한 endpoint와 worker를 끝까지 만들 때 | 저장소 상태를 읽고 `init`·`endpoint`·`worker`·테스트를 필요한 만큼 조합하는 진입 Skill입니다. |
| [`kp-api-deploy`](skills/kp-api-deploy/SKILL.md) | `1.0.0` | 사용자가 DEV 또는 PRD 배포를 명시했을 때 | 테스트 결과와 Firebase project, function 범위, 인증 주체와 권한을 확인하고 선택한 함수만 배포합니다. |
| [`kp-api-docs`](skills/kp-api-docs/SKILL.md) | `1.0.0` | 실제 배포된 공개 API를 Developer Center 문서에 반영할 때 | 로컬 Center 저장소에 공개 contract만 기록하고 1일 Preview와 임시 callback을 정리합니다. |

## 구조 선택 기준

도메인당 Firebase Functions codebase와 HTTP router를 처음 한 번 준비합니다. 이후 동기 요청 경로는 기존 router에 endpoint handler를 추가합니다. 독립 실행, 시간이 긴 작업, 큐 기반 재시도나 정기 실행이 필요한 기능만 worker로 분리합니다. 매 endpoint마다 새 Firebase codebase나 Cloud Function을 만들지 않습니다. HTTP API와 비동기 처리의 계약·권한·수명 주기가 실제로 다를 때만 분리합니다.

QT 구현은 참고 패턴이지 복사할 템플릿이 아닙니다. 새 프로젝트의 database, API key, runtime service account, queue, region, secret, project ID를 QT 저장소에서 가져오지 않습니다. 전체 codebase에서 확인한 구조와 사례별 예외는 [API 저장소 패턴 분석](skills/kp-api-init/references/api-project-architecture.md)에 정리했습니다.

## Developer Center API Docs

배포가 확인된 공개 API 계약은 [`kp-api-docs`](skills/kp-api-docs/SKILL.md)를 사용해 로컬 `kingdom-planet-center` 저장소에 반영합니다. DEV 문서는 [Developer Center DEV](https://developer-kpcenter-dev.web.app/api/)에, PRD 문서는 [Developer Center PRD](https://developer-kpcenter.web.app/api)에 배포합니다. worker, 관리자 기능, 내부 server-to-server 작업 API는 공개 문서에 자동으로 포함하지 않습니다.

실제 사이트에 바로 배포하지 않고 먼저 DEV Hosting Preview Channel에서 검토합니다. Preview는 1일 만료로 만들며, 로그인 검증에 임시 OAuth callback이 필요하면 추가 URL과 대상 앱 설정을 사용자에게 먼저 보여드리고 승인받습니다. 검토가 끝나면 임시 callback과 이번 작업의 Preview Channel을 정리합니다. 최종 DEV·PRD 배포는 사용자의 별도 승인을 거친 뒤 해당 API 환경에 맞춰 진행합니다.

## 새 코드베이스 초기화

모든 KP Skill에는 같은 프로젝트·에이전트 범위의 `kp-skill-manager` 세 Skill 전체가 필요합니다. 설치되어 있지 않으면 필요한 이유와 경로를 설명하고 사용자 동의를 받은 뒤 manager를 먼저 설치합니다. 거부하면 API Skill 설치를 진행하지 않습니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex --copy --yes
~~~

초기화 대상 저장소 루트에서 시작 Skill을 프로젝트 로컬로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill kp-api-init -a codex --copy --yes
~~~

초기화가 끝나면 일곱 Skill을 현재 에이전트의 프로젝트 로컬 경로에 설치합니다. 초기 router는 `$kp-api-test-deploy`로 먼저 검증합니다. 실제 DEV 또는 PRD 배포는 사용자가 환경과 배포 범위를 명시한 경우에만 `$kp-api-deploy` 절차를 따릅니다.

## 기존 API 저장소에 설치

`kp-api-init`을 실행할 필요 없이 전체 Skill을 필요한 저장소에 설치할 수 있습니다. 아래 명령은 네 에이전트의 프로젝트 로컬 경로에 전체 묶음을 복사합니다. 사용하지 않는 `-a` 옵션은 지웁니다.

manager가 같은 에이전트 경로에 없다면 아래 대상 Skill 명령보다 먼저 manager 전체를 같은 `-a` 옵션으로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

설치 기본 범위는 현재 프로젝트입니다. 저장소 안에서만 사용하려면 `--global`이나 `-g`를 추가하지 않습니다. 정본은 `kp-skill`의 `kp-api-skill/skills/`이며, 업데이트 후에는 `npx skills update`를 실행하고 기존 로컬 수정과 diff를 확인합니다.

## 계정·권한·비밀 정보

초기화는 실제 계정 비밀번호나 API key를 생성·수집하지 않습니다. 프로젝트의 `.gitignore`가 `AGENTS.local.md`를 제외하도록 하고, 로컬 설정에는 계정 이메일, DEV·PRD project ID, 인증 주체, 권한 오류에서 관측된 범위, Keychain·Secret Manager의 항목 이름만 둡니다. 비밀번호·OAuth token·API key·개인 키·서비스 계정 JSON은 OS Keychain 또는 조직 비밀 저장소에 보관하고, 승인된 프로세스에만 단기 제공합니다.

Google Workspace 계정이 있다는 것만으로 Cloud Functions 배포 권한이 생기지는 않습니다. 실제 403의 principal, project, 대상 함수·codebase, region, 거부된 permission을 확인해 프로젝트 관리자에게 최소 권한을 요청하도록 안내합니다. 역할을 추측하거나 `Owner`/`Editor`를 기본 요청하지 않습니다. 권한 모델과 수동 관리자 요청 양식은 [`kp-api-deploy` 접근 지침](skills/kp-api-deploy/references/access-and-secrets.md)에 있습니다.

개발·빌드·테스트에는 배포 권한을 제공하지 않는 환경을 기본으로 권장합니다. 가장 안전한 배포 경계는 agent가 credential을 직접 읽지 않는 제한형 배포 broker 또는 보호된 CI runner이며, DEV와 PRD의 identity를 분리하고 PRD 실행을 사람 승인으로 보호합니다. 권장 설계와 제한은 접근 지침에서 확인합니다.

모든 새 한국어 문서는 존댓말로 작성합니다. Skill에서 생성하거나 수정하는 프로젝트 문서와 `AGENTS.md`에도 같은 문체를 적용합니다.
