# 앱 초기화 템플릿

- authentication.ts를 대상 저장소의 src/schema/authentication.ts로 복사한다.
- kpClient.ts를 대상 저장소의 src/api/kpClient.ts로 복사한다.
- AGENTS.local.md를 저장소 루트로 복사한 뒤 사용자에게 받은 계정 값을 채우고 .gitignore에 추가한다.
- kpClient.ts의 import 경로는 대상 저장소의 alias와 실제 config/app 모듈에 맞춰 확인한다. KP endpoint와 응답 검증 동작을 확인 없이 바꾸지 않는다.
- Zod가 대상 저장소에 없으면 해당 저장소의 package manager로 의존성을 추가한다.
