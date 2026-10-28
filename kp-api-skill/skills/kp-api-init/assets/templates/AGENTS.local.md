# API 저장소 로컬 계정·환경 정보

이 파일에는 비밀이 아닌 로컬 설정만 기록합니다. Git 추적에서 제외하고 `git check-ignore -v AGENTS.local.md`로 확인합니다. 비밀번호, OAuth token, API key, session cookie, private key와 service-account JSON은 기록하지 않습니다. `kp-credential` 항목 이름은 Keychain 또는 Credential Manager의 라벨이며 파일 경로나 폴더가 아닙니다.

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

## 로컬 API credential 참조

| 용도/환경 | API header | `kp-credential` 항목 이름 | 승인된 API 범위 |
| --- | --- | --- | --- |
| {예: DEV 외부 service} | {예: X-API-Key} | {예: `kp-skill/<저장소>/dev/<service>-api-key`} | {허용된 API origin/path/method} |

로컬 개발 중 직접 호출하는 API credential은 `kp-credential add <항목이름>`의 숨김 입력으로 OS 자격 증명 저장소에 저장합니다. 사용자 승인 뒤 허용한 API origin·경로·method에 한해 `kp-credential request <항목이름> --url <HTTPS_URL>`로 사용합니다. 앱/API Skill 설치 단계에서 에이전트가 `kp-credential` CLI를 OS 사용자 환경에 자동 설치하고 `kp-credential --version` 및 일반 명령 탐색을 확인합니다. 누락되거나 오래된 경우 credential 작업 전에 자동으로 복구합니다. Node.js 20 이상과 npm이 없거나 npm 전역 prefix에 쓸 수 없어 설치가 실패하면 에이전트가 원인과 조치를 안내합니다. `kp-credential`은 일반 CLI 환경 변수나 브라우저 로그인 입력을 지원하지 않습니다. zsh 설정, `.env`, debug output, 명령 인수, log와 보고서에 실제 값을 넣지 않습니다.

Firebase Functions runtime secret은 배포된 함수가 사용할 값이므로 이 로컬 credential 표에 입력하지 않습니다. 필요한 경우 API 배포 Skill의 Secret Manager 절차를 별도로 따릅니다.

## 추가 비밀 아닌 환경 설정

위 표에서 다루지 않는 작업별 공개 설정만 기록합니다. 변수명만으로 비밀 여부를 판단하지 말고 실제 용도와 노출 경계를 확인합니다. API key, token, 비밀번호 등 실제 비밀값은 여기에 적지 않습니다.

| 환경 변수 또는 설정 이름 | 환경 | 값 | 사용 위치와 목적 |
| --- | --- | --- | --- |
| {설정 이름} | {로컬/DEV/PRD} | {확인된 비밀 아닌 값} | {설정 파일과 사용 목적} |

## 권한 관리자 연락

- project IAM 관리자 또는 팀: {확인된 담당자/그룹}
- 접근 요청 절차: {확인된 내부 ticket/문서}
- 승인된 배포 경로: {broker/CI 이름 또는 없음}
