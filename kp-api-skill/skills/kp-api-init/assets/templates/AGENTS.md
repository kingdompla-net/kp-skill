# KP API 저장소 지침

이 저장소는 {도메인/API 이름}의 Firebase Functions를 운영합니다. 코드를 변경하기 전에 실제 codebase, `firebase.json` 또는 별도 config, `package.json`, API 문서, `AGENTS.local.md`와 현재 작업 트리를 확인합니다.

## 문서 문체

- 새로 작성하거나 수정하는 한국어 문서는 존댓말로 작성합니다. `SKILL.md`, API 운영 문서, README, 참조 문서와 이 파일도 같은 규칙을 따릅니다.
- 저장소에서 명시적으로 다른 언어를 요구하는 문서는 해당 언어를 사용합니다. 한국어 설명은 존댓말로 작성합니다.

## 계정·권한·비밀

- `AGENTS.local.md`가 있으면 account, project ID, deploy principal과 허용된 함수 범위를 먼저 확인합니다. 이 파일에는 비밀번호·token·API key·private key를 기록하지 않습니다.
- [`.agents/references/cloud-access.md`](.agents/references/cloud-access.md)를 따라 개발·테스트 권한과 DEV/PRD deploy identity를 구분합니다. 실제 principal과 IAM permission을 근거로 관리자 요청을 작성합니다. agent가 권한을 부여하거나 오류를 우회하지 않습니다.
- runtime secret은 Secret Manager에 두고 필요한 함수에만 bind합니다. log·shell output·source·browser bundle에 secret을 기록하지 않습니다.

## Git 작업

- `main`/`dev`에서 직접 작업하지 않습니다. 작업별 lowercase 영문·숫자·hyphen branch를 만들고, 가능하면 작업용 worktree도 사용합니다. 관련 없는 변경을 보존합니다.
- 각 작업은 맥락별로 나누고 구현과 직접 검증이 끝난 단위로 commit합니다. commit 전 PR scope, 변경 경로·diff, 검사 결과, 위험과 PR template draft를 보고하고 사용자의 명시적 승인을 받습니다.
- commit 전 GitHub 인증 계정, `git var GIT_AUTHOR_IDENT`, `git var GIT_COMMITTER_IDENT`를 확인합니다. author와 committer는 같은 GitHub 계정이어야 하며, 이메일은 해당 계정에 인증된 주소나 GitHub noreply 주소를 사용합니다.
- 완료된 기능은 base 대상 PR로 제출하고 승인된 절차에 따라 merge합니다. `main`/`dev` 직접 push와 PR 없이 직접 merge하려면 각각 실행 직전에 사용자의 명시적 승인을 받습니다.

## Skills 연결

- 새 API domain codebase와 최초 router: `kp-api-init`
- 기존 router의 동기 HTTP endpoint: `kp-api-endpoint`
- 필요한 경우에만 Cloud Tasks/Scheduler worker: `kp-api-worker`
- 여러 API layer를 끝까지 구현: `kp-api-build`
- DEV·PRD와 격리된 test: `kp-api-test-deploy`
- 사용자 요청에 따른 DEV/PRD Firebase Functions 배포: `kp-api-deploy`
- 실제 배포된 공개 API를 Developer Center 문서에 반영: `kp-api-docs`

## 테스트와 Firebase 배포

- 개발 중에는 unit test와 demo project 기반 emulator를 우선 사용합니다. 관련 Firebase service emulator가 모두 연결됐는지 확인하고, 격리가 불완전하면 실제 project에 연결할 수 있다고 간주합니다.
- DEV/PRD에 배포하기 전에 `kp-api-test-deploy`의 검증 증거를 확인합니다. `--project`에는 확인한 정확한 project ID를 지정하고 active alias에만 의존하지 않습니다.
- API 기능 수정은 요청된 router export만 배포합니다. 요청 범위가 codebase 전체가 아니라면 전체 codebase를 배포하지 않습니다.
- 배포는 사용자가 환경과 function 범위를 명시해 요청했을 때만 합니다. 삭제, public invoker, IAM, queue, Secret Manager 변경은 대상과 영향을 설명하고 관리자 절차를 따릅니다.
- 실제 배포된 공개 API가 있으면 `kp-api-docs`로 Center 문서를 준비합니다. 내부 worker·Scheduler·server-to-server 운영 endpoint는 공개 catalog에 추가하지 않습니다.
- build/test 통과를 cloud 배포나 live API 응답 확인으로 보고하지 않습니다.

## 참조 자료

- 저장소 패턴, 코드베이스 지도, 테스트와 문서 공개 경계: 프로젝트에 설치된 `kp-api-init` Skill의 `references/api-project-architecture.md`를 확인합니다. Skill을 설치하지 않은 agent라면 저장소 유지 담당자에게 정본 경로를 확인합니다.
- IAM·secret·계정 보호: [`.agents/references/cloud-access.md`](.agents/references/cloud-access.md)
