# Firebase Functions 접근·권한·비밀 설계

이 문서는 API 개발 환경에 필요한 권한 모델과 권한이 부족할 때 관리자에게 전달할 정보를 정리합니다. 로그인 성공, 회사 이메일, Firebase project 접근, Functions IAM 권한은 서로 다른 사실입니다. 실제 실행 환경과 오류를 확인한 뒤 권한을 결정합니다.

## 권장 배포 harness

코드 작성·빌드·테스트 process에 project write credential을 넣지 않습니다. 같은 사용자 권한으로 실행되는 shell은 파일과 credential을 읽을 수 있으므로 Secret Manager나 Keychain에 값을 저장하는 것만으로는 process 간 격리가 되지 않습니다.

~~~text
Agent 작업 환경
  ├─ source, emulator, mock/local test에 접근합니다.
  ├─ Firebase/GCP live 배포 credential을 보유하지 않습니다.
  └─ 사용자가 승인한 배포 요청을 전달합니다.
       ↓ commit SHA + environment + function/codebase allowlist
제한된 deploy broker 또는 보호된 CI runner
  ├─ DEV/PRD별 identity와 단기 WIF/OIDC credential을 사용합니다.
  ├─ target project와 function scope를 확인합니다.
  ├─ PRD 실행은 사람 승인 gate로 보호합니다.
  └─ credential 없이 배포 receipt를 반환합니다.
       ↓
해당 환경의 Firebase Functions
~~~

### Deploy broker 또는 보호된 CI

가능하면 agent가 임의의 `gcloud`·Firebase CLI command를 실행하지 않고, 범위가 정해진 배포 도구나 CI job을 호출하도록 구성합니다. broker는 다음 조건을 서버 측에서 확인합니다.

- repository/commit, DEV·PRD, 허용된 Firebase project와 function 범위를 확인합니다. client가 전달한 project ID를 그대로 신뢰하지 않습니다.
- 코드 검증 후 선택한 commit SHA만 가져오고, 예상하지 않은 코드 변경이나 함수 삭제가 있으면 배포를 차단합니다.
- DEV와 PRD에 별도 Workload Identity Federation provider 또는 신뢰 경로와 deploy service account를 사용합니다. PRD identity는 agent의 일반 세션에서 접근할 수 없게 합니다.
- GitHub Actions의 OIDC 조건은 지정 repository, trusted branch/tag 또는 protected environment로 제한합니다. 조직 전체나 임의 외부 identity에 service account impersonation을 허용하지 않습니다.
- PRD는 protected GitHub Environment 또는 동등한 승인 gate를 거칩니다. 사용자가 환경·함수·commit을 확인할 수 있게 합니다.
- deploy service account는 배포에 필요한 권한만 받고 IAM 변경, secret value 읽기, 임의 service account impersonation 권한은 갖지 않게 합니다. 가능한 경우 project 전체보다 대상 resource와 환경으로 scope를 좁힙니다.
- CI와 Google Cloud audit log에 사용자 승인, 외부 identity, impersonated service account, commit SHA, 환경과 함수 목록을 남깁니다. token이나 secret value를 log나 agent 출력에 남기지 않습니다.

Workload Identity Federation은 장기 service-account key를 피하는 수단이지 좁은 권한을 자동 보장하지는 않습니다. 허용할 외부 principal과 대상 service account를 제한하고 service account가 접근할 수 있는 resource도 최소화합니다.

### Agent 호스트에서 직접 DEV 배포가 필요한 경우

- 사용자 홈 디렉터리, gcloud ADC 파일, Firebase 로그인 상태와 브라우저 profile을 agent sandbox에 그대로 연결하지 않습니다. `gcloud` CLI 계정 설정과 ADC는 별개이므로 각각 확인합니다.
- 직접 배포가 불가피하면 사용자 전역 계정이 아닌 격리 환경의 전용 DEV deploy identity를 사용합니다. 제한된 target과 단기 credential만 제공하고 PRD credential이나 PRD project 권한은 제공하지 않습니다. Firebase CLI가 해당 credential 방식을 지원하는지는 실제 CLI version에서 확인합니다.
- Keychain은 저장 시 보호를 제공하지만 동일 사용자 권한의 임의 process를 자동 격리하지 않습니다. agent가 임의 shell을 실행할 수 있는 세션에서 Keychain credential을 process에 전달하면 해당 세션이 사용할 수 있다고 간주합니다.
- zsh 설정 파일에는 secret value가 아니라 환경 변수 이름, Keychain item label, 보안 wrapper 경로만 기록합니다. `.env`, shell history, process argument, debug log, `set -x`, 전체 `env` 출력에 비밀값을 남기지 않습니다.
- 로컬 emulator는 비밀이 아닌 fixture나 임시 값으로 실행합니다. DEV/PRD Secret Manager value를 로컬 `.env`에 복사하지 않습니다.

## API runtime secret

함수에서 사용하는 외부 API key, private credential, DB password는 Firebase/Google Cloud Secret Manager에 저장하고 필요한 function export에만 `secrets` binding으로 연결합니다. secret 생성·교체·값 접근은 코드 배포와 별도의 권한 작업입니다. 사용자가 명시적으로 요청하지 않으면 수행하지 않습니다. `AGENTS.local.md`에는 secret value 대신 이름, 환경, 관리 principal, 사용 함수와 승인된 로컬 참조만 기록합니다.

## 로컬 환경 정보

`AGENTS.local.md`는 Git에서 제외합니다. 비밀번호·token·API key·private key·service-account JSON을 기록하지 않고, 확인되지 않은 칸은 추측해 채우지 않습니다.

| 환경 | Firebase project ID | Firebase deploy principal | gcloud CLI principal | ADC principal/credential source | codebase/function 허용 범위 |
| --- | --- | --- | --- | --- | --- |
| DEV | {확인된 project ID} | {확인된 principal} | {확인된 principal} | {사용자, impersonated SA 또는 없음} | {실제 범위} |
| PRD | {확인된 project ID} | {보호된 deploy principal} | {사용자 또는 없음} | {없음 또는 보호된 runner} | {승인된 범위} |

| 자격 증명 용도 | 실제 환경 변수 이름 | 비밀 저장소 항목 또는 broker 이름 | 허용된 실행 위치 |
| --- | --- | --- | --- |
| {예: DEV 외부 API} | {예: SERVICE_API_KEY} | {Secret Manager resource name} | {해당 function export만} |

## 권한 오류 분석과 관리자 요청

Deploy 403 또는 IAM 오류가 발생하면 다음 사실을 비밀값 없이 확보합니다.

1. 인증 provider가 표시한 deploy principal과 impersonated principal을 확인합니다.
2. 환경, 정확한 Firebase project ID, config 파일, codebase/function 이름과 region을 확인합니다.
3. 실제로 거부된 permission, 수행 중이던 작업, 발생 시간과 CLI version을 기록합니다.
4. 작업이 사용자 요청 범위에 포함되는지, 다른 함수나 IAM 설정에 영향이 있는지 확인합니다.
5. Firebase/GCP 공식 IAM 문서와 관리자 정책을 보고 최소 역할·custom permission 집합과 resource scope를 검토합니다. 근거가 없는 역할 이름이나 role bundle은 적지 않습니다.

관리자에게 전달할 요청 초안은 다음 형식을 사용합니다.

~~~text
목적: [사용자가 승인한 배포 또는 기능]
환경 / Firebase project: [DEV 또는 PRD] / [정확한 project ID]
실행 주체: [관측한 principal]
대상: [config, codebase, function export, region]
실패한 작업과 permission: [실제 403에서 확인한 작업과 permission]
요청 권한: [공식 문서·정책과 대조한 최소 권한 또는 검토 요청]
범위·만료: [가능한 resource 범위와 필요한 기간]
검증 방법: [같은 명령과 대상에서 권한 적용 여부를 재확인하는 방법]
~~~

관리자가 IAM을 변경한 후에는 정확한 principal, project와 function 범위에 필요한 권한만 생겼는지 확인합니다. agent가 자기 권한을 부여하거나, 우회 계정으로 전환하거나, `Owner`/`Editor` 같은 포괄 role을 임시 사용하지 않습니다.

## 공식 참고 자료

- [Firebase IAM 권한과 Functions 배포 요건](https://firebase.google.com/docs/projects/iam/permissions)
- [특정 Cloud Functions 배포](https://firebase.google.com/docs/functions/manage-functions)
- [Firebase Functions codebase 구성](https://firebase.google.com/docs/functions/organize-functions)
- [로컬 Application Default Credentials](https://docs.cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)
- [Workload Identity Federation 보안 권장 사항](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [Service account impersonation](https://docs.cloud.google.com/iam/docs/service-account-impersonation)
- [서비스 계정 보안 권장 사항](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)
- [Cloud Functions 환경 값과 Secret Manager](https://firebase.google.com/docs/functions/config-env)
