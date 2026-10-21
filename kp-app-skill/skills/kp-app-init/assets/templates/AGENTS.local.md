# 저장소 로컬 Git 계정 규칙

- 이 저장소의 GitHub 로그인 계정은 {GitHub 사용자 계정}이다. Git 작업의 계정도 반드시 이 GitHub 계정과 같아야 한다.
- 이 저장소에서 만드는 커밋의 author와 committer는 모두 위 GitHub 계정의 사용자여야 한다. author·committer 이름은 {GitHub 계정의 표시 이름}, 이메일은 해당 계정에 인증된 이메일 또는 그 계정의 GitHub noreply 주소를 사용한다.
- Git identity는 저장소 로컬 설정으로 지정하고 전역 Git 설정은 변경하지 않는다.
- 커밋 전에 `git var GIT_AUTHOR_IDENT`와 `git var GIT_COMMITTER_IDENT`를 확인한다. 이름이 위 표시 이름과 일치하고 두 이메일이 모두 위 GitHub 계정에 인증되어 있거나 해당 계정의 noreply 주소인지 검증한다. 확인할 수 없거나 일치하지 않으면 커밋하지 말고 사용자에게 확인한다.
- GitHub 원격 쓰기 전에 실제 인증 계정을 확인하고 위 GitHub 계정으로 수행한다. Git identity와 인증 계정의 동일성을 확인할 수 없으면 쓰기 작업을 진행하지 말고 사용자에게 확인한다.

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
