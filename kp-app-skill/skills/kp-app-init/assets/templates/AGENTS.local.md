# 저장소 로컬 계정·환경 설정

이 파일은 로컬 전용 운영 참고 자료입니다. 반드시 `.gitignore`에 추가하고 추적되지 않는지 확인합니다. 계정 식별자와 비밀 저장소의 항목 이름만 기록합니다. 비밀번호, 세션 쿠키, OAuth token, API key, 인증서, 개인 키, 서비스 계정 JSON은 기록하지 않습니다.

## GitHub와 Git identity

- 이 저장소의 GitHub 로그인 계정은 {GitHub 사용자 계정}입니다. Git 작업의 계정도 반드시 이 GitHub 계정과 같아야 합니다.
- 이 저장소에서 만드는 커밋의 author와 committer는 모두 위 GitHub 계정의 사용자여야 합니다. author·committer 이름은 {GitHub 계정의 표시 이름}, 이메일은 해당 계정에 인증된 이메일 또는 그 계정의 GitHub noreply 주소를 사용합니다.
- Git identity는 저장소 로컬 설정으로 지정하고 전역 Git 설정은 변경하지 않습니다.
- 커밋 전에 `git var GIT_AUTHOR_IDENT`와 `git var GIT_COMMITTER_IDENT`를 확인합니다. 이름이 위 표시 이름과 일치하고 두 이메일이 모두 위 GitHub 계정에 인증되어 있거나 해당 계정의 noreply 주소인지 검증합니다. 확인할 수 없거나 일치하지 않으면 커밋하지 말고 사용자에게 확인합니다.
- GitHub 원격 쓰기 전에 실제 인증 계정을 확인하고 위 GitHub 계정으로 수행합니다. Git identity와 인증 계정의 동일성을 확인할 수 없으면 쓰기 작업을 진행하지 말고 사용자에게 확인합니다.

## Firebase·Google Cloud 환경

| 환경 | Firebase CLI 계정 | gcloud CLI 계정 | ADC 주체 | Firebase 프로젝트 ID | Hosting 사이트 ID |
| --- | --- | --- | --- | --- | --- |
| DEV | {계정 이메일} | {계정 이메일} | {사용자 또는 서비스 계정 주체} | {DEV 프로젝트 ID} | {DEV 사이트 ID} |
| PRD | {계정 이메일 또는 별도 승인 계정} | {계정 이메일 또는 별도 승인 계정} | {사용자 또는 서비스 계정 주체} | {PRD 프로젝트 ID} | {PRD 사이트 ID} |

gcloud CLI 로그인 계정과 Application Default Credentials(ADC)는 별도로 확인합니다. 하나의 gcloud configuration을 바꿔도 ADC 주체가 바뀌지 않을 수 있습니다. 계정 이메일이 프로젝트의 IAM 권한을 뜻하지 않으므로 요청된 환경과 실제 권한을 각각 확인합니다.

## KP Developer Center / API 문서 계정

| 환경 | 이메일/계정 | 인증 수단의 로컬 참조 | 추가 인증·메모 |
| --- | --- | --- | --- |
| DEV | {사용자 계정} | {Keychain 항목 또는 조직 비밀 저장소 경로} | {필요 시} |
| PRD | {사용자 계정 또는 DEV와 동일} | {Keychain 항목 또는 조직 비밀 저장소 경로} | {필요 시} |

## {KP 앱} 테스트 계정 정보

| 환경 | 권한 | 이메일 | 비밀 저장소의 항목 이름 |
| --- | --- | --- | --- |
| DEV | {테스트 권한} | {테스트 계정 이메일} | {Keychain 항목 또는 조직 비밀 저장소 경로} |

## 비밀 저장소 참고

| 용도 | 환경 변수 이름 | 값이 있는 위치 |
| --- | --- | --- |
| {예: 로컬 개발 API} | {예: KP_API_KEY} | {Keychain 항목 또는 조직 비밀 저장소 경로} |

비밀값을 터미널 출력, 로그, 명령 인수, `.env` 파일, 테스트 결과, 최종 보고에 출력하지 않습니다. 필요한 경우 비밀 저장소에서 프로세스 단위로 환경 변수를 주입하는 승인된 도구를 사용합니다.
