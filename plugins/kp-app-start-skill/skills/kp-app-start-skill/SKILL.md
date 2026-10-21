---
name: kp-app-start-skill
description: "화면 설계 소스가 준비된 저장소를 KP API 기반 React 앱으로 초기화하고, 인증·환경 설정·에이전트 개발 규칙·프로젝트 안내 문서를 연결할 때 사용한다."
---

# KP 앱 초기화

이미 화면 설계가 끝난 프론트엔드 소스를 실제 KP API 앱으로 연결한다. 기존 화면과 사용자의 작업물을 보존하고, 새 앱의 API 계약과 권한은 최신 KP 공식 문서 및 사용자가 제공한 앱 설정으로 확인한다.

## 적용 범위와 시작 확인

1. 대상 저장소 루트, 적용되는 AGENTS.md, 현재 브랜치와 git status --short --branch를 확인한다. 기존 수정·미추적 파일은 보존하고, 화면 설계 소스를 인벤토리해 새 구조에 매핑한다.
2. 사용자가 이미 준 값을 다시 묻지 않는다. 다음 값 중 저장소나 대화에서 확인할 수 없는 값은 한 번에 묶어 요청한다.
   - KP APP_ID: 사용자가 KP Developer Center에서 직접 확인해 제공해야 한다. 앱 ID를 추측하거나 다른 저장소에서 가져오지 않는다. DEV/PRD가 다르면 각 값을 받고, 같으면 양쪽 환경에 같은 값을 쓴다는 확인을 받는다.
   - 로컬 OAuth callback: 기본값은 http://localhost:3000/auth/callback이다. 개발 서버 포트가 다르면 실제 URL을 받는다. localhost와 127.0.0.1은 서로 다른 redirect URI다.
   - PRD OAuth callback 및 Firebase 프로젝트 ID·Hosting 사이트·운영 도메인.
   - KP Developer Center 로그인 계정: API 문서 열람에 필요하다. 기존 AGENTS.local.md를 확인하고 정보가 없으면 사용자에게 받은 뒤 기록한다.
   - 확정 구조의 store/slices/와 모든 폴더명 단수 원칙이 충돌한다. 이 초기화에서 해당 경로가 필요하면 store/slice/로 바꿀지, 기존 경로의 예외로 둘지 확인한다.
3. VITE_APP_NAME은 package.json의 name에서 만들고, VITE_APP_DESCRIPTION은 package 설명·README·화면의 실제 목적에 맞춰 쓴다. 앱 이름 변환이 PascalCase인지 공백으로 구분한 이름인지 불명확하면 예시를 제시해 확인한다. 설명을 지어낼 근거가 없으면 사용자에게 목적을 묻는다.
4. AGENTS.local.md는 assets/templates/AGENTS.local.md를 바탕으로 사용자가 제공한 계정 정보를 채운다. 계정 정보가 필요해지는 시점은 아래 기준을 따른다. 이 파일은 계정·테스트 자격 증명을 포함하므로 .gitignore에 추가하고 git check-ignore -v로 무시되는지 확인한다. 비밀번호와 앱 ID를 최종 보고에 다시 출력하지 않는다.
   - KP API 문서를 읽을 때는 Developer Center 계정을 확인한다. 계정 정보가 없으면 사용자에게 받아 AGENTS.local.md에 추가한 뒤 문서를 읽는다.
   - Git identity나 GitHub 원격 인증, Firebase/GCP 작업, 로컬·개발 서버 테스트에 계정이 필요하면 해당 정보를 AGENTS.local.md에서 확인한다. 정보가 없거나 불완전하면 필요한 작업 전에 사용자에게 받아 파일을 갱신한다. 서버 테스트에 DEV 테스트 계정이 필요하면 권한·이메일·비밀번호를 확인한다.

## 구현 기준

- 아래 확정 구조와 references/project-guide.md의 책임 경계를 적용한다. 새로운 화면을 다시 디자인하지 말고 현재 화면, 콘텐츠, 컴포넌트를 구조에 매핑한다.
- 먼저 최신 KP 공식 API 문서를 읽고 docs/kp-api-analysis.md에 필요한 endpoint, HTTP method, 인증, app_id, 요청·응답 필드, 페이지네이션, 권한을 기록한다. 확인되지 않은 endpoint·필드·권한은 추측하지 않는다.
- KP API 문서는 [DEV Developer Center](https://developer-kpcenter-dev.web.app/api) 또는 [PRD Developer Center](https://developer-kpcenter.web.app/api)에서 해당 환경의 계약을 확인한다. 로그인 계정은 대상 저장소의 AGENTS.local.md에서 확인하고, 접속 전 활성 계정이 맞는지 검증한다.
- assets/templates/kpClient.ts를 src/api/kpClient.ts로, assets/templates/authentication.ts를 src/schema/authentication.ts로 추가한다. 기존 앱 구성과 충돌하는 import 경로만 실제 alias에 맞춰 조정한다. 해당 클라이언트가 요구하는 config/app와 Vite 환경 타입 선언을 조사해 없을 때만 보완한다.
- Zod가 없으면 저장소의 package manager를 확인해 런타임 의존성으로 추가한다. npm 저장소라면 npm i zod를 사용하고 lockfile을 함께 갱신한다.
- 기존 파일을 덮어쓰지 않는다. 같은 경로에 기존 코드가 있으면 소비자와 테스트를 확인하고 필요한 동작을 합친다.
- 화면 요청은 hook/query/에 TanStack Query key·query·mutation을 두고, 전역 클라이언트 상태는 store/의 Zustand에 둔다. 서버 응답을 Zustand에 중복 보관하지 않는다. 확정 구조에 없는 서비스 계층은 임의로 추가하지 않는다. 여러 API 호출로 이루어진 흐름도 우선 query/mutation에서 조정하되, 새 계층이 필요해 보이면 구조를 바꾸기 전에 사용자에게 묻는다.
- 설정이 끝나면 references/agent-ide.md를 읽고 현재 사용 중인 에이전트에 맞춰 biome-eslint-ide-config-skill을 찾아 설치하고 실행한다. 그 스킬의 사용자 확인 절차와 전체 파일 자동 수정 승인 단계를 생략하지 않는다.
- 외부 쓰기, 발송, 결제, 실제 데이터 변경, Hosting 배포는 별도 사용자의 명시적 요청 전에는 하지 않는다. 작업 범위와 직접 연결된 테스트·빌드만 수행한다.

## 마무리

초기화, 코드 연결, 로컬 검증이 끝나면 대상 저장소에서 /init을 실행한다. 생성된 결과를 확인하고 아래 문서 계약에 맞게 보완한다.

- 루트 AGENTS.md에 실제 폴더 트리를 그리고 .agents/references/의 상세 문서와 하위 AGENTS.md로 연결한다.
- 각 주요 소스 계층에 해당 코드의 실제 지도와 책임을 담은 AGENTS.md를 만든다. 경로는 최소한 src/api/, src/schema/, src/type/, src/store/, src/hook/, src/provider/, src/router/, src/component/, src/page/, src/config/, src/util/을 조사한다.
- 루트와 참조 문서에는 모든 새 폴더명·함수명·변수명을 단수로 짓는 Dixsoft 원칙을 기록한다. 배열 등 집합 변수는 userList, memberMap처럼 단수 도메인명 뒤에 자료형 의미를 붙인다. KP wire 필드·endpoint, 외부 라이브러리 계약은 바꾸지 않는다.
- 빌드, 테스트, 정적 분석 결과와 실제 DEV OAuth·주요 읽기 동작 결과를 나누어 보고한다. 실제 브라우저 동작을 확인하지 못했으면 코드 수준 검증과 구분해 적는다.

## 필요한 상세 자료

- 인증·API·저장소 경계: [references/kp-api-and-security.md](references/kp-api-and-security.md)
- 목표 프로젝트 문서 구조: [references/project-guide.md](references/project-guide.md)
- 에이전트별 IDE 스킬 설치와 실행: [references/agent-ide.md](references/agent-ide.md)
- 새 앱 파일로 복사할 코드: assets/templates/
