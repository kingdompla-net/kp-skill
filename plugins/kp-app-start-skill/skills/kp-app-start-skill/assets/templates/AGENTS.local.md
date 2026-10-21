# 저장소 로컬 Git 계정 규칙

- 이 저장소에서 수행하는 GitHub 원격 작업은 {사용자 계정}으로 한다.
- 이 저장소에서 만드는 커밋의 author와 committer 이름은 모두 {사용자 계정}으로 설정한다. 이메일은 {사용자 계정 GitHub 이메일}을 사용한다.
- Git identity는 저장소 로컬 설정으로 지정하고 전역 Git 설정은 변경하지 않는다.
- 커밋 전에 git var GIT_AUTHOR_IDENT와 git var GIT_COMMITTER_IDENT를 확인해 두 identity가 모두 {사용자 계정}인지 검증한다.
- GitHub 원격 쓰기 전에 실제 인증 계정을 확인하고 {사용자 계정} 계정으로 수행한다.

## Firebase 계정

Firebase CLI(MCP), GCP(gcloud CLI, MCP 등)에서 사용할 계정: {사용자 계정}

## KP Developer Center / API Docs 로그인 계정

| 환경 | 이메일/계정 | 비밀번호 또는 로그인 방법 | 추가 인증·메모 |
| --- | --- | --- | --- |
| DEV | {사용자 계정} | {사용자 제공 정보} | {필요 시} |
| PRD | {사용자 계정 또는 DEV와 동일} | {사용자 제공 정보 또는 DEV와 동일} | {필요 시} |

## {KP 앱} 테스트 계정 정보

| 환경 | 권한 | 이메일 | 비밀번호 |
| --- | --- | --- | --- |
| DEV | lv100 | {사용자 이메일} | {사용자 비밀번호} |
