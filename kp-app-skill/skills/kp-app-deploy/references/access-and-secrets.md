# Firebase 배포 계정과 비밀 정보

- `AGENTS.local.md`에는 환경별 Firebase 프로젝트 ID, Hosting 사이트 ID, 계정 이메일, 인증 주체, Secret Manager·Keychain 항목 참조 등 비밀이 아닌 값만 기록합니다. 이 파일은 Git에서 제외합니다.
- 비밀번호, OAuth token, 개인 키, 서비스 계정 JSON, API key를 `AGENTS.local.md`, 셸 초기화 파일, 저장소 `.env`, 명령 인수, 로그에 쓰지 않습니다. OS Keychain 또는 조직 비밀 저장소에 보관하고 필요한 배포 프로세스에만 환경 변수로 제공합니다.
- 개발 에이전트가 실행하는 임의 명령은 현재 사용자 프로세스에서 접근 가능한 파일과 credential을 읽을 수 있습니다. Keychain을 사용하더라도 해당 사용자 세션의 프로세스가 조회 가능한 credential은 분리되지 않습니다. 가능한 경우 빌드·코드 작업과 배포 주체를 분리하고 PRD credential을 일반 개발 세션에 제공하지 않습니다.
- Firebase CLI 로그인, gcloud CLI 로그인, ADC는 별도의 인증 경로입니다. gcloud configuration을 변경해도 ADC 주체는 바뀌지 않을 수 있습니다. 세 주체와 대상 프로젝트를 각각 확인합니다.
- 로그인 성공은 프로젝트 IAM 허용을 뜻하지 않습니다. 권한 오류가 나면 실제 principal, 프로젝트, 리소스, 거부된 permission과 요청 작업을 기록해 관리자에게 전달합니다. 확인 없이 `Owner`나 `Editor`를 요청하지 않습니다.
- 원격 배포는 사용자가 배포 대상과 환경을 명시했을 때만 진행합니다. Firebase CLI가 요청 범위 밖 제품·사이트·리소스를 배포하려 하거나 추가 권한 설정을 묻는 경우 중단하고 계획된 변경을 설명합니다.

공식 자료: [Firebase IAM 권한](https://firebase.google.com/docs/projects/iam/permissions), [로컬 ADC 설정](https://docs.cloud.google.com/docs/authentication/set-up-adc-local-dev-environment), [Cloud Functions 비밀 설정](https://firebase.google.com/docs/functions/config-env).
