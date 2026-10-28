# 저장소 로컬 계정·환경 설정

이 파일은 로컬 전용 운영 참고 자료입니다. 반드시 `.gitignore`에 추가하고 추적되지 않는지 확인합니다. 계정 식별자와 비밀 저장소의 항목 이름만 기록합니다. 비밀번호, 세션 쿠키, OAuth token, API key, 인증서, 개인 키, 서비스 계정 JSON은 기록하지 않습니다. `kp-credential` 항목 이름은 파일 경로나 폴더가 아니라 Keychain 또는 Credential Manager 안의 항목 라벨입니다.

## GitHub와 Git identity

- 이 저장소의 GitHub 로그인 계정은 {GitHub 사용자 계정}입니다. Git 작업의 계정도 반드시 이 GitHub 계정과 같아야 합니다.
- 이 저장소에서 만드는 커밋의 author와 committer는 모두 위 GitHub 계정의 사용자여야 합니다. author·committer 이름은 {GitHub 계정의 표시 이름}, 이메일은 해당 계정에 인증된 이메일 또는 그 계정의 GitHub noreply 주소를 사용합니다.
- Git identity는 저장소 로컬 설정으로 지정하고 전역 Git 설정은 변경하지 않습니다.
- 커밋 전에 `git var GIT_AUTHOR_IDENT`와 `git var GIT_COMMITTER_IDENT`를 확인합니다. 이름이 위 표시 이름과 일치하고 두 이메일이 모두 위 GitHub 계정에 인증되어 있거나 해당 계정의 noreply 주소인지 검증합니다. 확인할 수 없거나 일치하지 않으면 커밋하지 말고 사용자에게 확인합니다.
- GitHub 원격 쓰기 전에 실제 인증 계정을 확인하고 위 GitHub 계정으로 수행합니다. Git identity와 인증 계정의 동일성을 확인할 수 없으면 쓰기 작업을 진행하지 말고 사용자에게 확인합니다.

## Firebase·Google Cloud 환경

| 환경 | Firebase CLI 계정 | gcloud CLI 계정 | ADC 주체 | Firebase Hosting project ID | Hosting 사이트 ID | Hosting target | 앱 runtime Firebase project ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DEV | {계정 이메일} | {계정 이메일} | {사용자 또는 서비스 계정 주체} | `kp-app-k00001` | {앱 DEV 사이트 ID} | {DEV Hosting target} | {DEV runtime project ID} |
| PRD | {계정 이메일 또는 별도 승인 계정} | {계정 이메일 또는 별도 승인 계정} | {사용자 또는 서비스 계정 주체} | `kp-app-k00001` | {앱 PRD 사이트 ID} | {PRD Hosting target} | {PRD runtime project ID} |

Firebase Hosting 배포에는 `kp-app-k00001`과 위의 앱별 site ID를 사용합니다. Firebase SDK runtime 설정에는 마지막 열의 앱별 project ID를 유지합니다.

gcloud CLI 로그인 계정과 Application Default Credentials(ADC)는 별도로 확인합니다. 하나의 gcloud configuration을 바꿔도 ADC 주체가 바뀌지 않을 수 있습니다. 계정 이메일이 프로젝트의 IAM 권한을 뜻하지 않으므로 요청된 환경과 실제 권한을 각각 확인합니다.

## KP Developer Center / API 문서 계정

| 환경 | 이메일/계정 | 인증 수단의 로컬 참조 | 추가 인증·메모 |
| --- | --- | --- | --- |
| DEV | {사용자 계정} | {Keychain 항목 또는 조직 비밀 저장소 경로} | {필요 시} |
| PRD | {사용자 계정 또는 DEV와 동일} | {Keychain 항목 또는 조직 비밀 저장소 경로} | {필요 시} |

## KP System App ID

`KP_SYSTEM_APP_ID`는 Preview의 `appSetApp` 및 `appGetApp` 요청에서 query parameter `app_id`에 사용하는 시스템 앱 식별자입니다. Request Body의 `app_id`는 변경 대상 앱 식별자이므로 별도로 확인합니다. API key와 token은 기록하지 말고 비밀 저장소의 항목 이름만 기록합니다.

| 환경 | KP 앱 이름 | `KP_SYSTEM_APP_ID` |
| --- | --- | --- |
| DEV | {DEV KP 앱 이름} | {DEV KP_SYSTEM_APP_ID} |
| PRD | {PRD KP 앱 이름} | {PRD KP_SYSTEM_APP_ID} |

## KP App Preview 작업 기록

Preview channel과 callback을 추적하고 검토가 끝난 뒤 정리할 수 있도록 기록합니다. 실제 token, API key, 비밀번호는 기록하지 않습니다.

| 환경 | Firebase project / site / target | Channel ID | Branch / commit / PR | Preview URL / 만료 | Callback URL | 배포 전 callback 상태 | 정리 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| {DEV 또는 승인된 PRD} | {project / site / target} | {channel ID} | {branch / commit / PR} | {Preview URL / 만료 시각} | {callback URL 또는 해당 없음} | {기존 / 이번에 추가 / 해당 없음} | {미정리 / 정리 완료} |

## 추가 비밀 아닌 앱 설정

위 표에서 다루지 않는 작업별 공개 설정만 기록합니다. `VITE_` 값은 브라우저 bundle에 포함될 수 있으므로 공개되어도 되는 값인지 확인합니다. API key, token, 비밀번호 등 실제 비밀값은 여기에 적지 않습니다.

| 환경 변수 또는 설정 이름 | 환경 | 값 | 사용 위치와 목적 |
| --- | --- | --- | --- |
| {설정 이름} | {로컬/DEV/PRD} | {확인된 비밀 아닌 값} | {설정 파일과 사용 목적} |

## {KP 앱} 테스트 계정 정보

| 환경 | 권한 | 이메일 | 비밀 저장소의 항목 이름 |
| --- | --- | --- | --- |
| DEV | {테스트 권한} | {테스트 계정 이메일} | {Keychain 항목 또는 조직 비밀 저장소 경로} |

## 로컬 API 비밀 저장소 참고

| 용도 | API request header | Keychain 항목 이름 |
| --- | --- | --- |
| {예: 로컬 개발 API} | {예: `X-API-Key` 또는 `Authorization`} | {예: `kp-skill/<저장소>/<환경>/<용도>`} |

API key·token은 `kp-credential`에 숨김 입력으로 저장하고, API의 origin·경로·HTTP method·header 범위를 승인합니다. 앱/API Skill 설치 단계에서 에이전트가 `kp-credential` CLI를 OS 사용자 환경에 자동 설치하고 `kp-credential --version` 및 일반 명령 탐색을 확인합니다. 누락되거나 오래된 경우 credential 작업 전에 자동으로 복구합니다. 이후 에이전트는 `kp-credential request <항목이름> --url <HTTPS_URL>`로 요청합니다. Node.js 20 이상과 npm이 없거나 npm 전역 prefix에 쓸 수 없어 설치에 실패하면 에이전트가 원인과 조치를 안내합니다. 저장값을 직접 읽는 명령은 사용하지 않습니다.

비밀값을 대화, 터미널 출력, 로그, 명령 인수, `.env` 파일, 테스트 결과, 최종 보고에 넣지 않습니다. 이 도구는 임의 CLI에 비밀값을 환경 변수로 주입하거나 브라우저 로그인 비밀번호를 입력하는 용도로 사용하지 않습니다.
