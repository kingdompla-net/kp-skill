# 앱 초기화 템플릿

- `authentication.ts`를 대상 저장소의 `src/schema/authentication.ts`로 복사합니다.
- `kpClient.ts`를 대상 저장소의 `src/api/kpClient.ts`로 복사합니다.
- `AGENTS.local.md`를 저장소 루트로 복사한 뒤, 사용자가 제공한 계정 값을 입력하고 `.gitignore`에 추가합니다.
- `.agents/references/commit-rule.md`와 `.agents/references/pr-rule.md`를 대상 저장소의 같은 상대 경로에 복사합니다.
- `.references/PULL_REQUEST_TEMPLATE.md`를 대상 저장소의 같은 상대 경로에 복사합니다.
- 기존 파일은 덮어쓰지 않습니다. 기존 내용이 있으면 필요한 규칙을 합치고, 루트 `AGENTS.md`에서 세 참조 파일을 연결합니다.
- `kpClient.ts`의 import 경로는 대상 저장소의 alias와 실제 config/app 모듈에 맞춰 확인합니다. 확인하지 않은 KP endpoint와 응답 검증 동작은 변경하지 않습니다.
- 대상 저장소에 Zod가 없으면 해당 저장소의 package manager로 의존성을 추가합니다.
