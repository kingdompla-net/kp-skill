# KP API·인증·데이터 기준

## API 문서화

각 앱에서 쓰는 기능만 대상 환경의 KP Developer Center API 문서로 확인해 docs/kp-api-analysis.md에 기록한다.

| 환경 | 공식 API 문서 |
| --- | --- |
| DEV | https://developer-kpcenter-dev.web.app/api |
| PRD | https://developer-kpcenter.web.app/api |

API 문서는 KP 로그인 계정이 있어야 열람할 수 있습니다. 대상 저장소의 AGENTS.local.md에서 Developer Center 이메일과 인증 수단의 로컬 참조를 확인합니다. 계정 정보가 없으면 사용자에게 이메일 등 비밀이 아닌 식별 정보만 확인합니다. 비밀번호·세션 token은 문서나 셸 초기화 파일에 기록하지 않고 승인된 비밀 저장소를 사용합니다. 현재 활성 사이트 계정이 기록된 계정과 일치하는지 확인합니다. DEV와 PRD 문서가 다를 수 있으므로 두 환경을 사용하는 앱은 각각 계약을 확인합니다.

| 기능 | Endpoint | Method | 인증 | app_id 전달 | 요청·응답 스키마 | 페이지네이션 | 최소 권한 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 기능별로 기록 | 공식 문서의 실제 값 | 실제 값 | 실제 값 | 실제 값 | 실제 필드와 Zod 스키마 | 실제 방식 | 실제 값 |

문서에 없는 endpoint나 필드는 만들지 않는다. 문서를 확인할 수 없으면 그 의존 기능을 임의 구현하지 말고 접근이 필요한 문서와 막힌 범위를 설명한다. API key 전용 endpoint는 브라우저 Bearer 인증으로 동작한다고 가정하지 않는다.

## 공통 KP 클라이언트

- 브라우저 요청은 로그인 사용자 Authorization: Bearer <access_token>을 사용한다. KP_API_KEY, X-API-KEY, X-KP-UID 또는 비밀 키를 브라우저 번들이나 VITE_ 변수에 넣지 않는다.
- KP URL·토큰 헤더·공통 응답 envelope·네트워크 오류·세션 갱신은 src/api/kpClient.ts에 모은다. 기능 endpoint는 src/api/{domain}.ts의 작은 함수로 감싼다.
- 새 요청은 KP 응답 envelope와 기능별 Zod schema를 검증한 뒤 UI에 전달한다. 원시 서버 메시지와 토큰을 사용자 화면에 노출하지 않는다.
- 로그인 세션이 있는 요청에서 일반 401은 refresh cookie로 한 번만 갱신 후 재시도한다. Member required는 만료로 간주해 refresh하지 말고 가입 흐름으로 넘긴다.
- 외부 API 응답의 snake_case 필드 등 KP wire 계약을 프론트엔드 네이밍 원칙에 맞추어 임의 변경하지 않는다.

## OAuth와 권한

1. authorize URL에 실제 app_id, 등록된 redirect_uri, response_type=code를 넣는다. callback은 일회성 code를 /v2/auth/user/sign으로 교환한다.
2. callback에서 /auth/user와 /app/member를 확인하고 UID·앱 권한을 검증한 뒤 세션을 만든다. 인증 전 callback과 공개 화면을 업무 경로에서 분리한다.
3. 가입 전 level=0이면 /app/의 app_info.is_private를 확인한다. 공개 앱은 /app/member/join 흐름을 사용하고 비공개 앱은 공식 문서의 가입 요청 절차를 확인한다. 가입 레벨과 관리 권한은 별도로 취급한다.
4. 각 화면과 mutation에 실제 /app/member 결과에 근거한 최소 권한을 적용한다. OAuth authorize에서 state가 반환되는지, PKCE 지원 여부를 새 앱마다 확인한다. 미지원 동작을 CSRF 완전 방어로 표현하지 않는다.
5. 토큰은 브라우저에서 다루므로 XSS 위험을 고려한다. 외부 HTML은 sanitize하고, URL·파일 타입·파일 크기를 검증한다. 실제 배포 도메인의 refresh cookie와 CORS는 DEV에서 확인한 결과와 구분한다.

## 저장과 위험 작업

- KP가 원본인 데이터는 KP API에 저장한다. 화면 전용 임시 데이터만 로컬에 둔다. 로컬 저장을 선택하면 앱 ID·UID별로 분리하고 기기 간 동기화·백업이 되지 않는 점을 UI나 제품 문서에 설명한다.
- 원격 데이터와 요청 상태는 TanStack Query, UI 전용 전역 상태는 Zustand로 둔다.
- KP API가 제공하지 않는 삭제를 로컬 숨김으로 표시할 수는 있으나 원격 삭제라고 말하지 않는다.
- 발송·결제·일괄 변경처럼 중복 실행 위험이 있는 동작은 대상 재조회와 확인, 대상별 처리 상태, 결과 불명 상태를 설계한다. submitting 이후 결과를 알 수 없으면 자동 재시도하지 않는다. 브라우저 IndexedDB 잠금은 여러 기기의 중복을 막지 못한다.
- API 접수와 실제 외부 완료는 구분한다. 실제 부작용의 검증은 사용자의 별도 확인 없이 실행하지 않는다.

## 환경 기본값

| 변수 | .env.development | .env.production |
| --- | --- | --- |
| VITE_KP_URL | https://dev.kingdompla.net | https://kingdompla.net |
| VITE_KP_API_BASE_URL | https://kp-api-dev.web.app | https://kp-api.web.app |
| VITE_KP_APP_ID | 사용자가 제공한 DEV 앱 ID | 사용자가 제공한 PRD 앱 ID 또는 동일 앱 ID 확인값 |

환경별 URL은 현재 KP 앱 기준값이다. 새 앱 저장소의 문서와 공식 KP 설정이 다르면 확인한 최신 값을 우선하고 차이를 기록한다. VITE_KP_API_BASE_URL에는 /v2를 붙이지 않는다. 공통 클라이언트 또는 앱 설정이 API 버전을 추가한다.

.env.development와 .env.production은 .gitignore에 정확히 추가한다. 저장소에 예제 환경 파일 관례가 있으면 실제 ID를 포함하지 않는 예제만 추적한다. 앱 ID는 공개 클라이언트 설정으로 취급하지만, 환경 파일에는 요청된 대로 로컬 값으로 관리한다.
