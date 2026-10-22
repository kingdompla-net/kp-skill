# 계정·권한·비밀 정보

- `AGENTS.local.md`에는 계정 식별자, Firebase project ID, deploy principal, 허용 함수 범위, Keychain·Secret Manager item reference처럼 비밀이 아닌 정보만 기록합니다. Git에서 제외하고 `git check-ignore -v`로 확인합니다.
- 비밀번호, session cookie, OAuth token, API key, private key, service-account JSON은 저장소 파일, shell 설정, `.env`, 명령 인수, log, agent 대화에 기록하지 않습니다. OS Keychain이나 조직 secret manager에 두고 승인된 process에 필요한 시간만 전달합니다.
- 같은 사용자 권한의 agent process는 사용자 파일과 credential에 접근할 수 있습니다. Keychain 저장만으로 같은 사용자 process가 격리되지 않습니다. 개발·빌드·테스트에는 배포 credential을 제공하지 않습니다.
- Firebase CLI principal, gcloud CLI principal과 ADC principal은 별도로 확인합니다. 로그인 account가 project IAM 권한을 의미하지 않습니다.
- 권한 오류에서는 실제 principal, project, codebase/function/region, denied permission과 operation을 확보합니다. 실제 오류와 공식 IAM 문서를 근거로 최소 권한을 요청하고 role을 추측하지 않습니다.
- 기본 구조는 credentialless 개발·테스트 lane과 별도 deploy broker/protected CI lane입니다. DEV와 PRD identity를 분리하고 PRD를 사람 승인으로 보호합니다. Workload Identity Federation은 credential 수명을 줄이지만 service account 권한을 자동으로 제한하지 않으므로 principal과 role scope를 좁힙니다.
- deploy identity에 IAM policy 변경, 과도한 service account impersonation, Secret Manager value 접근을 함께 부여하지 않습니다. runtime service account와 deploy service account를 분리합니다.
- 새 문서와 수정하는 한국어 설명은 존댓말로 작성합니다.

자세한 harness 구성과 관리자 요청 형식은 프로젝트에 설치된 `kp-api-deploy`의 `references/access-and-secrets.md`에서 확인합니다.
