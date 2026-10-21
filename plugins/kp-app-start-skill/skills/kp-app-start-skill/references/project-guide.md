# KP 앱 프로젝트 안내 문서 계약

## 목표 소스 구조

~~~text
src/
├── main.tsx
├── App.tsx
├── router/
│   └── Router.tsx
├── provider/
│   ├── AppProvider.tsx
│   ├── AuthProvider.tsx
│   └── AuthContext.ts
├── api/
│   ├── kpClient.ts
│   └── {domain}.ts
├── schema/
├── type/
├── store/
│   ├── slices/
│   └── store.ts
├── hook/
│   ├── query/
│   └── ui/
├── component/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   └── {domain}/
├── page/
├── config/
├── util/
└── styles.css
~~~

경로의 빈 폴더는 만들지 않는다. 각 디렉터리의 파일은 실제 앱 화면과 기능을 조사해 배치한다.

## 레이어 책임

| 경로 | 책임 |
| --- | --- |
| src/main.tsx | React 시작점 |
| src/App.tsx | 앱 Provider와 BrowserRouter 조립 |
| src/router/ | JSX route 선언, 공개·인증 경계, AppShell 경계 |
| src/provider/ | Query·Auth·Tooltip·Sonner Provider 조립, 인증 Context |
| src/api/ | KP HTTP 클라이언트와 도메인별 요청 함수 |
| src/schema/ | 외부 API request/response의 Zod 런타임 계약 |
| src/type/ | 화면과 기능에서 쓰는 프론트엔드 모델 |
| src/store/ | Zustand slice 및 UI 클라이언트 상태 |
| src/hook/query/ | 기능별 Query·Mutation·query key 및 서버 상태 조정 |
| src/hook/ui/ | DOM·상호작용 중심 UI hook |
| src/component/ui/ | Radix/shadcn primitive |
| src/component/common/ | kit, ContentBlock, NavLink 등 앱 공통 요소 |
| src/component/layout/ | AppShell, 헤더, 사이트 로고 등 공통 레이아웃 |
| src/component/{domain}/ | 도메인 전용 UI |
| src/page/ | 라우트 화면과 하위 페이지 |
| src/config/ | 검증된 환경 설정 |
| src/util/ | 부작용이 없는 재사용 도우미와 변환 |

권장 흐름은 화면 → query hook → 도메인 API → kpClient → KP API다. Zod 응답 schema와 프론트엔드 모델을 섞지 않는다. service/는 확정된 기본 구조에 없으므로 먼저 만들지 않는다. 구체적인 요구로 별도 계층이 필요하면 사용자에게 구조 변경을 확인한다.

## 프로젝트용 AGENTS 문서

/init 실행 후 실제 구현을 기준으로 다음 문서 지도를 만든다.

- 루트 AGENTS.md: 한두 문장 개요, 실제 폴더 트리, 개발·검증 명령, `.agents/references/`와 하위 `AGENTS.md` 링크, 범용 규칙을 둔다. 커밋·PR 작업은 `.agents/references/commit-rule.md`와 `.agents/references/pr-rule.md`로 연결하고, PR 템플릿은 `.references/PULL_REQUEST_TEMPLATE.md`로 연결한다. 세부 규칙은 해당 참조 문서에 두고 AGENTS.md에는 라우팅 링크를 유지한다. Git identity나 원격 인증, Firebase/GCP, 로컬·개발 서버 테스트, KP API 문서 열람에 계정이 필요한 경우 `AGENTS.local.md`를 먼저 확인한다. 정보가 없거나 불완전하면 사용자가 필요한 정보를 제공하도록 요청하고, 무시 규칙이 적용된 `AGENTS.local.md`를 추가·갱신한 뒤 진행한다. 계정 정보를 추적 문서에 복사하지 않는다.
- .agents/references/project-overview.md: 앱 목적, 실제 계층 구조, 엔트리 포인트, 라우팅과 Provider 조립.
- .agents/references/api-contract.md: 도메인 API map, KP endpoint·인증·권한·Zod schema 문서의 위치와 Developer Center 문서 링크. API 문서 로그인 계정은 AGENTS.local.md에서 확인한다.
- .agents/references/auth-and-data.md: OAuth·세션 수명주기, Query/Zustand 경계, 원본 데이터와 로컬 데이터 규칙.
- .agents/references/local-setup.md: mode별 환경 변수 이름, 로컬 명령, AGENTS.local.md의 계정 정보 위치와 비밀값 취급 규칙. 실제 비밀값은 적지 않는다.
- 각 주요 src/{layer}/AGENTS.md: 그 계층의 책임, 핵심 실제 파일·export·소비자, 테스트 위치, 해당 계층에서 금지할 의존 방향. src/hook/은 query/와 ui/ 사용법도 정리한다.

## 커밋·PR 규칙 템플릿

- `assets/templates/.agents/references/commit-rule.md`는 대상 저장소의 `.agents/references/commit-rule.md`로 복사한다.
- `assets/templates/.agents/references/pr-rule.md`는 대상 저장소의 `.agents/references/pr-rule.md`로 복사한다.
- `assets/templates/.references/PULL_REQUEST_TEMPLATE.md`는 대상 저장소의 `.references/PULL_REQUEST_TEMPLATE.md`로 복사한다.
- 대상 저장소의 루트 `AGENTS.md`는 위 세 파일로 연결한다. 기존 문서가 있으면 덮어쓰지 않고 필요한 내용을 합친다.

루트 지침은 상세 내용을 반복하지 말고 정확한 참조 경로를 안내한다. 각 문서에 존재하지 않는 파일이나 미구현 동작을 적지 않는다. 구조도와 코드 지도는 실제 소스를 반영한다.

### 계정 정보 확인

- Git identity나 GitHub 원격 인증, Firebase/GCP 작업, 로컬·개발 서버 테스트, KP API 문서 열람을 시작하기 전에 대상 저장소 루트의 AGENTS.local.md를 확인한다.
- 필요한 계정 정보가 없거나 해당 환경에 필요한 정보가 빠졌으면 사용자에게 필요한 항목만 요청하고, 답변을 받아 AGENTS.local.md를 추가하거나 갱신한다. 이 파일이 .gitignore에 포함되어 있는지 확인한다.
- 계정 비밀번호와 테스트 자격 증명은 AGENTS.local.md에만 둔다. 추적되는 AGENTS.md와 .agents/references/ 문서에는 자격 증명을 복사하지 않는다.
- KP API 계약은 [DEV Developer Center](https://developer-kpcenter-dev.web.app/api)와 [PRD Developer Center](https://developer-kpcenter.web.app/api)에서 확인한다. 사용할 환경의 문서를 읽고, 로그인 계정은 AGENTS.local.md의 Developer Center 항목을 따른다.

## 이름 규칙

- 새 폴더명, 함수명, 변수명은 단수형을 쓴다. 예: component, getUser, userList, memberMap.
- 사용자 제안 트리의 store/slices/는 이 원칙과 충돌한다. 해당 디렉터리를 만들기 전에 store/slice/로 바꿀지 기존 경로의 예외로 둘지 사용자에게 확인한다.
- 배열·map·set도 명사 기본형은 단수로 두고 List, Map, Set으로 자료형을 구분한다. users, members처럼 복수형을 사용하지 않는다.
- KP 응답 필드, HTTP endpoint, 외부 라이브러리 API, 프레임워크가 요구하는 식별자는 외부 계약이므로 이름을 바꾸지 않는다.
- 기존 이름은 앱 초기화 범위와 실제 참조를 확인해 필요할 때만 조정한다. 일괄 이름 변경으로 사용자 화면 소스나 비관련 작업을 훼손하지 않는다.

## 초기화 후 확인

- npm run build와 저장소에 이미 정의된 관련 정적 검사·테스트를 실행한다. 테스트 스크립트가 없으면 임의로 추가하지 말고 필요한 최소 검증을 설명한다.
- DEV OAuth callback, 로그인, 권한 확인, 핵심 읽기 API를 실제 브라우저에서 확인한다. 화면·탭·DOM 증거가 필요하면 현재 환경의 aside-browser 지침을 따른다.
- 빌드·테스트는 코드 증거다. 실제 OAuth, 외부 API, 배포 도메인 cookie/CORS는 각 환경에서 직접 관찰한 경우에만 성공으로 보고한다.
- Hosting 배포, PR, commit, push는 별도 요청이 없으면 하지 않는다.
