# 앱 초기화 템플릿

- `authentication.ts`를 대상 저장소의 `src/schema/authentication.ts`로 복사합니다.
- `kpClient.ts`를 대상 저장소의 `src/api/kpClient.ts`로 복사합니다.
- 이 템플릿을 저장소 루트의 `AGENTS.local.md`로 먼저 복사합니다. 요청된 비밀 아닌 계정·환경 값은 원본 template이 아니라 프로젝트 로컬 복사본의 알맞은 항목에 설정하고, `.gitignore`에서 무시되며 Git이 추적하지 않는지 확인합니다. 실제 비밀값은 기록하지 않습니다.
- `.agents/references/commit-rule.md`와 `.agents/references/pr-rule.md`를 대상 저장소의 같은 상대 경로에 복사합니다.
- `.references/PULL_REQUEST_TEMPLATE.md`를 대상 저장소의 같은 상대 경로에 복사합니다.
- 기존 파일은 덮어쓰지 않습니다. 기존 내용이 있으면 필요한 규칙을 합치고, 루트 `AGENTS.md`에서 세 참조 파일을 연결합니다.
- `kpClient.ts`의 import 경로는 대상 저장소의 alias와 실제 config/app 모듈에 맞춰 확인합니다. 확인하지 않은 KP endpoint와 응답 검증 동작은 변경하지 않습니다.
- 대상 저장소에 Zod가 없으면 해당 저장소의 package manager로 의존성을 추가합니다.
