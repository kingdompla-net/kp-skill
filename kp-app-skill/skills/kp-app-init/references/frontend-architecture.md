# KP 앱 프론트엔드 아키텍처 및 프로젝트 문서 계약

## 권장 프론트엔드 구조

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

## 계층 책임과 데이터 흐름

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

## 생성 프로젝트의 문서 구조

/init 실행 후 실제 구현을 기준으로 다음 문서 지도를 만든다.

- `.agents/references/spec.md`: 대상 저장소의 실제 프레임워크·라이브러리·검사 도구, 선언 범위와 lockfile 버전, Node.js·패키지 관리자 고정 여부, 검증 명령을 기록합니다. 루트 `AGENTS.md`에서 연결하고 모든 작업자가 기술 스택을 변경하기 전에 읽고 함께 갱신하도록 합니다.
- 루트 AGENTS.md: 한두 문장 개요, 실제 폴더 트리, 개발·검증 명령, `.agents/references/`와 하위 `AGENTS.md` 링크, 범용 규칙을 둔다. 작업마다 최소한 `main`/`dev`가 아닌 별도 작업 브랜치를 사용하고, 권장 방식은 작업별 워크트리와 브랜치를 함께 만드는 것이라고 명시한다. 모든 작업을 목적 맥락별로 나눠 각 맥락의 구현·직접 검증 후 독립 커밋을 남기고, 최종 완료 시 확인된 base 대상 PR을 생성해 필수 검사와 리뷰가 끝나면 병합한다고 명시한다. PR 없이 작업 브랜치를 base에 직접 병합하려면 사용자의 사전 명시적 승인을 받도록 한다. `main`/`dev`에 직접 push하려면 push 직전에 매번 사용자의 명시적 승인을 받도록 한다. GitHub 원격 인증 계정과 Git 커밋 identity가 같은 사용자 계정이어야 하며, `AGENTS.local.md`에 정한 author·committer 이름과 이메일을 커밋 전에 확인하도록 명시한다. author와 committer 이메일은 모두 해당 GitHub 계정에 인증된 이메일 또는 그 계정의 noreply 주소여야 한다. 커밋·PR 작업은 `.agents/references/commit-rule.md`와 `.agents/references/pr-rule.md`로 연결하고, PR 템플릿은 `.references/PULL_REQUEST_TEMPLATE.md`로 연결한다. 세부 규칙은 해당 참조 문서에 두고 AGENTS.md에는 라우팅 링크를 유지한다. 설치된 KP Skill의 실제 프로젝트 로컬 경로를 기록하고, 초기화·구조 연결은 `kp-app-init`, 명시적으로 요청한 Firebase Hosting 배포는 `kp-app-deploy`로 연결한다. Git identity나 원격 인증, Firebase/GCP, 로컬·개발 서버 테스트, KP API 문서 열람에 계정이 필요한 경우 `AGENTS.local.md`를 먼저 확인한다. 정보가 없거나 불완전하면 사용자가 필요한 정보를 제공하도록 요청하고, 무시 규칙이 적용된 `AGENTS.local.md`를 추가·갱신한 뒤 진행한다. 계정 정보를 추적 문서에 복사하지 않는다.
- .agents/references/project-overview.md: 앱 목적, 실제 계층 구조, 엔트리 포인트, 라우팅과 Provider 조립.
- .agents/references/api-contract.md: 도메인 API map, KP endpoint·인증·권한·Zod schema 문서의 위치와 Developer Center 문서 링크. API 문서 로그인 계정은 AGENTS.local.md에서 확인한다.
- .agents/references/auth-and-data.md: OAuth·세션 수명주기, Query/Zustand 경계, 원본 데이터와 로컬 데이터 규칙.
- .agents/references/local-setup.md: mode별 환경 변수 이름과 로컬 명령을 기록합니다. 실제 비밀값은 적지 않습니다.
- .agents/references/cloud-access.md: 비밀 저장소, Firebase·GCP 주체, 환경 분리와 권한 관리자에게 요청할 정보를 설명합니다.
- 각 주요 src/{layer}/AGENTS.md: 그 계층의 책임, 핵심 실제 파일·export·소비자, 테스트 위치, 해당 계층에서 금지할 의존 방향. src/hook/은 query/와 ui/ 사용법도 정리한다.

## 생성 프로젝트의 규칙 템플릿

- `assets/templates/.agents/references/commit-rule.md`는 대상 저장소의 `.agents/references/commit-rule.md`로 복사한다.
- `assets/templates/.agents/references/pr-rule.md`는 대상 저장소의 `.agents/references/pr-rule.md`로 복사한다.
- `assets/templates/.references/PULL_REQUEST_TEMPLATE.md`는 대상 저장소의 `.references/PULL_REQUEST_TEMPLATE.md`로 복사한다.
- `assets/templates/firebase.json`은 대상 저장소에 `firebase.json`이 없을 때 Hosting 기반으로 사용한다. 기존 설정이 있으면 대상 앱의 rewrite·header·배포 설정을 보존하면서 필요한 값을 합친다.
- `assets/templates/.firebaserc.example`은 Firebase 프로젝트 ID와 Hosting 사이트 ID가 확인된 경우에만 `.firebaserc`를 만들거나 갱신하는 예시로 사용한다. 예시 안의 대체 문자열을 그대로 배포에 사용하지 않는다.
- 대상 저장소의 루트 `AGENTS.md`는 위 세 파일로 연결한다. 기존 문서가 있으면 덮어쓰지 않고 필요한 내용을 합친다.

루트 지침은 상세 내용을 반복하지 말고 정확한 참조 경로를 안내한다. 각 문서에 존재하지 않는 파일이나 미구현 동작을 적지 않는다. 구조도와 코드 지도는 실제 소스를 반영한다.

## 실행 환경과 계정 정보

- Git identity나 GitHub 원격 인증, Firebase/GCP 작업, 로컬·개발 서버 테스트, KP API 문서 열람을 시작하기 전에 대상 저장소 루트의 AGENTS.local.md를 확인합니다. 비밀·권한 기준은 [.agents/references/cloud-access.md 템플릿](../assets/templates/.agents/references/cloud-access.md)을 대상 저장소에 복사해 사용합니다.
- 필요한 계정 식별자나 환경 정보가 없으면 사용자에게 해당 값만 요청해 AGENTS.local.md를 갱신합니다. 비밀번호·token·API key는 입력받아 이 파일에 기록하지 않습니다. 파일이 .gitignore에 포함되어 있는지 확인합니다.
- 커밋 전 활성 GitHub 계정과 `git var GIT_AUTHOR_IDENT`, `git var GIT_COMMITTER_IDENT`를 확인한다. author·committer의 이름은 AGENTS.local.md에 정한 값을 사용하고, 두 이메일이 모두 같은 GitHub 계정에 인증된 이메일 또는 그 계정의 noreply 주소인지 검증한다. 계정이 다르거나 확인할 수 없으면 커밋하지 않는다.
- AGENTS.local.md에는 비밀 저장소의 이름과 환경 변수 이름만 둡니다. 비밀값은 OS Keychain 또는 조직 비밀 저장소에 보관하고 필요한 명령 프로세스에만 주입합니다. GitHub 계정, Firebase CLI 계정, gcloud CLI 계정, ADC 주체와 프로젝트 IAM 권한을 각각 확인합니다.
- KP API 계약은 [DEV Developer Center](https://developer-kpcenter-dev.web.app/api)와 [PRD Developer Center](https://developer-kpcenter.web.app/api)에서 확인한다. 사용할 환경의 문서를 읽고, 로그인 계정은 AGENTS.local.md의 Developer Center 항목을 따른다.

## Firebase Hosting 구성과 배포 Skill 연결

`kp-church-website`에서 사용하는 DEV 흐름을 기준으로 하되, Firebase 프로젝트 ID와 Hosting 사이트 ID는 초기화 대상 저장소의 환경별 설정을 사용한다.

- Vite 개발 빌드는 `npm run build:dev`에서 `vite build --mode development`를 실행한다.
- DEV 배포 스크립트는 `npm run deploy:dev`에서 빌드 후 `firebase deploy --only hosting:dev --project <DEV_FIREBASE_PROJECT_ID>`를 실행한다. 배포 범위를 `hosting:dev`로 한정하고 프로젝트 ID를 명시한다.
- PRD 설정을 확인한 앱은 `npm run build:prd`에서 `vite build --mode production`을 실행하고, `npm run deploy:prd`에서 빌드 후 `firebase deploy --only hosting:prd --project <PRD_FIREBASE_PROJECT_ID>`를 실행한다. 배포 범위를 `hosting:prd`로 한정하고 PRD 프로젝트 ID를 명시한다.

앱 초기화에서 대상 `package.json`의 기존 `scripts`를 보존하면서 아래 DEV 항목을 반드시 추가한다. PRD Firebase 프로젝트 ID와 Hosting 사이트 ID가 확인된 경우에만 PRD 항목도 추가한다. 모든 `<...>` 값은 초기화 중 확인한 실제 ID로 치환하며 대체 문자열을 남기지 않는다. 같은 이름의 스크립트가 이미 있으면 동작을 확인해 합치고 안전한 통합이 불가능하면 사용자에게 결정받는다.

~~~json
{
  "scripts": {
    "build:dev": "vite build --mode development",
    "deploy:dev": "npm run build:dev && firebase deploy --only hosting:dev --project <DEV_FIREBASE_PROJECT_ID>",
    "build:prd": "vite build --mode production",
    "deploy:prd": "npm run build:prd && firebase deploy --only hosting:prd --project <PRD_FIREBASE_PROJECT_ID>"
  }
}
~~~

- `firebase.json`은 `hosting` 배열에 논리 별칭 `dev`와 `prd`를 각각 구성하고 `public`은 `dist`를 사용한다. SPA는 `**`를 `/index.html`로 rewrite한다. HTML 등 기본 파일은 `no-cache`, `/assets/**`는 `public, max-age=31536000, immutable`로 설정한다.
- `.firebaserc`는 각 Firebase 프로젝트 아래 `hosting.dev`와 `hosting.prd`를 별도로 연결한다. 논리 타깃은 같아도 실제 프로젝트 ID와 Hosting 사이트 ID는 환경별로 다를 수 있다. 참조 저장소의 사이트 ID를 대상 저장소에 복사하지 않는다.
- 기존 `package.json`, `firebase.json`, `.firebaserc`를 먼저 확인하고 덮어쓰지 않는다. Firebase Hosting 설정이 없으면 `assets/templates/firebase.json`의 `dev`·`prd` 타깃을 사용하되, PRD 값이 확정되지 않았으면 `prd` 항목을 완성된 설정으로 남기지 않는다. `.firebaserc`와 배포 스크립트에도 확인되지 않은 ID를 쓰지 않는다.
- DEV와 PRD에는 각각 확인된 Firebase 프로젝트 ID·Hosting 사이트 ID·도메인과 Vite mode를 연결한다. DEV 프로젝트·사이트·mode를 PRD에 재사용하지 않는다. 두 환경이 동일한 실제 Firebase 프로젝트를 사용한다고 확인된 경우에만 `.firebaserc` 안에서 해당 프로젝트 아래 두 논리 타깃을 함께 관리한다.
- Firebase 설정과 빌드 검증은 실제 Hosting 배포와 별개다. 실제 배포는 사용자가 환경을 명시해 요청했을 때만 하고, 대상 저장소에 프로젝트 로컬 설치된 `kp-app-deploy` Skill의 사전 검증·보고 절차를 따른다.

## 아키텍처 명명 원칙

- 새 폴더명, 함수명, 변수명은 단수형을 쓴다. 예: component, getUser, userList, memberMap.
- 사용자 제안 트리의 store/slices/는 이 원칙과 충돌한다. 해당 디렉터리를 만들기 전에 store/slice/로 바꿀지 기존 경로의 예외로 둘지 사용자에게 확인한다.
- 배열·map·set도 명사 기본형은 단수로 두고 List, Map, Set으로 자료형을 구분한다. users, members처럼 복수형을 사용하지 않는다.
- KP 응답 필드, HTTP endpoint, 외부 라이브러리 API, 프레임워크가 요구하는 식별자는 외부 계약이므로 이름을 바꾸지 않는다.
- 기존 이름은 앱 초기화 범위와 실제 참조를 확인해 필요할 때만 조정한다. 일괄 이름 변경으로 사용자 화면 소스나 비관련 작업을 훼손하지 않는다.

## 아키텍처 적용 후 검증

- npm run build와 저장소에 이미 정의된 관련 정적 검사·테스트를 실행한다. 테스트 스크립트가 없으면 임의로 추가하지 말고 필요한 최소 검증을 설명한다.
- DEV OAuth callback, 로그인, 권한 확인, 핵심 읽기 API를 실제 브라우저에서 확인한다. 화면·탭·DOM 증거가 필요하면 현재 환경의 aside-browser 지침을 따른다.
- 빌드·테스트는 코드 증거다. 실제 OAuth, 외부 API, 배포 도메인 cookie/CORS는 각 환경에서 직접 관찰한 경우에만 성공으로 보고한다.
- Hosting 배포는 사용자가 별도로 명시적으로 요청한 경우에만 한다. 커밋과 PR 생성·base 병합은 위에 라우팅한 맥락별 커밋·PR 규칙을 따른다. PR 없는 직접 브랜치 병합과 `main`/`dev` 직접 push는 각각 사전 승인을 받는다.
