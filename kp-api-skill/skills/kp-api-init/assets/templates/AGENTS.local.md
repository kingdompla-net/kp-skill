# API 저장소 로컬 계정·환경 정보

이 파일에는 비밀이 아닌 로컬 설정만 기록합니다. Git 추적에서 제외하고 `git check-ignore -v AGENTS.local.md`로 확인합니다. 비밀번호, OAuth token, API key, session cookie, private key와 service-account JSON은 기록하지 않습니다.

## GitHub·Git identity

- GitHub 계정: {확인된 GitHub username}
- author/committer 표시 이름: {GitHub 계정 표시 이름}
- author/committer 이메일: {계정에 인증된 이메일 또는 해당 계정 noreply 주소}
- 원격 쓰기 인증 주체: {GitHub 계정 또는 credential manager profile 이름}

Git author와 committer는 위 GitHub 계정과 일치해야 합니다. commit 전에 `git var GIT_AUTHOR_IDENT`, `git var GIT_COMMITTER_IDENT`와 활성 GitHub 계정을 확인합니다.

## Firebase·Google Cloud 프로젝트와 권한

| 환경 | Firebase project ID | Firebase deploy principal | gcloud CLI principal | ADC principal/출처 | codebase/function 허용 범위 |
| --- | --- | --- | --- | --- | --- |
| 로컬 emulator | `demo-{도메인}-local` | 없음 | 없음 | 없음 | loopback emulator만 허용합니다. |
| Dedicated test | {별도 test project ID 또는 미설정} | {확인된 principal 또는 없음} | {확인된 principal 또는 없음} | {없음 또는 보호된 runner} | {승인된 test function 범위} |
| DEV | {확인된 project ID} | {확인된 principal} | {확인된 principal} | {사용자, impersonated SA 또는 없음} | {승인된 codebase/function} |
| PRD | {확인된 project ID} | {보호된 deploy principal} | {사용자 또는 없음} | {없음 또는 protected runner} | {승인된 codebase/function} |

`gcloud` CLI account와 Application Default Credentials는 별도로 확인합니다. Firebase CLI가 사용하는 배포 principal도 실제 환경과 CLI 설정으로 검증합니다. 이메일 주소만으로 project IAM 권한을 단정하지 않습니다.

## Secret 저장소 참조

| 용도/환경 | 환경 변수 이름 | Secret Manager 또는 Keychain 항목 이름 | 사용하는 함수 |
| --- | --- | --- | --- |
| {예: DEV 외부 service} | {예: SERVICE_API_KEY} | {확인한 항목 이름} | {function export} |

secret value는 OS Keychain, Firebase/Google Cloud Secret Manager 또는 조직 secret manager에 둡니다. zsh 설정에는 value 대신 item label이나 보안 wrapper 경로를 둡니다. debug output, 명령 인수, log와 보고서에 value를 출력하지 않습니다.

## 권한 관리자 연락

- project IAM 관리자 또는 팀: {확인된 담당자/그룹}
- 접근 요청 절차: {확인된 내부 ticket/문서}
- 승인된 배포 경로: {broker/CI 이름 또는 없음}
