# 계정·권한·비밀 정보

- `AGENTS.local.md`에는 로컬 개발자 이메일, GitHub 계정과 Git identity, Firebase 프로젝트 ID, Secret Manager·Keychain 항목 참조처럼 비밀이 아닌 값만 기록합니다. `.gitignore`가 적용되는지 확인합니다.
- 비밀번호, OAuth token, 세션 쿠키, API key, 개인 키, 서비스 계정 key JSON은 `AGENTS.local.md`, 추적 파일, 셸 초기화 파일, `.env` 또는 명령 인수에 넣지 않습니다. 비밀은 OS Keychain 또는 조직 비밀 저장소에 두고, 승인된 도구가 꼭 필요한 프로세스에만 환경 변수로 전달하게 합니다.
- 개발 에이전트 프로세스가 실행할 수 있는 명령은 현재 사용자에게 보이는 파일과 자격 증명에 접근할 수 있습니다. Keychain에 저장했다는 사실만으로 해당 에이전트 세션에서 비밀이 격리되는 것은 아닙니다. 배포 자격 증명은 개발·테스트 권한과 분리합니다.
- Firebase CLI 계정, gcloud CLI 계정, Application Default Credentials(ADC) 주체는 각각 확인합니다. gcloud configuration 변경이 ADC 주체를 바꾸지 않을 수 있습니다. 계정 이메일과 프로젝트 IAM 권한도 구분합니다.
- 권한 오류가 나면 실제 principal, 환경·프로젝트, 대상 리소스, 거부된 permission, 수행하려던 작업을 확인해 권한 관리자에게 전달합니다. `Owner`/`Editor`를 기본 요청하지 않고, 확인된 작업에 필요한 최소 범위 권한과 만료 가능성을 요청합니다.
- DEV와 PRD에는 별도 프로젝트와 배포 주체를 둡니다. PRD 자격 증명은 일반 코드 작성·테스트 세션에 제공하지 않습니다. 직접 배포가 필요하면 `kp-app-deploy`의 인증·환경 사전 검사를 따릅니다.
