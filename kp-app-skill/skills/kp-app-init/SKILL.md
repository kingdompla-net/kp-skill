---
name: kp-app-init
description: "화면 설계 소스가 준비된 저장소를 KP API 기반 React 앱으로 초기화하고, 인증·환경 설정·에이전트 개발 규칙·프론트엔드 아키텍처 문서를 연결할 때 사용합니다."
metadata:
  version: "2.8.1"
---

# KP 앱 초기화

이미 화면 설계가 끝난 프론트엔드 소스를 실제 KP API 앱으로 연결한다. 기존 화면과 사용자의 작업물을 보존하고, 새 앱의 API 계약과 권한은 최신 KP 공식 문서 및 사용자가 제공한 앱 설정으로 확인한다.

## 버전 관리

- 정본 버전은 YAML frontmatter의 `metadata.version`이다.
- 기존 동작과 호환되는 지침·템플릿 추가는 minor, 호환되는 오류 수정은 patch, 기존 사용 흐름이나 계약을 깨는 변경은 major 버전을 올린다.
- 각 Skill의 `metadata.version`은 개별 이력으로 관리하고 플러그인 README 표와 일치시킵니다. `.claude-plugin/plugin.json`, 루트 `.claude-plugin/marketplace.json`, 저장소와 플러그인의 영문·한국어 README에 적는 플러그인 버전은 서로 일치시킵니다.

## 적용 범위와 시작 확인

1. 대상 저장소 루트, 적용되는 AGENTS.md, 현재 브랜치와 git status --short --branch를 확인한다. 기존 수정·미추적 파일은 보존하고, 화면 설계 소스를 인벤토리해 새 구조에 매핑한다.
2. 사용자가 이미 준 값을 다시 묻지 않는다. 다음 값 중 저장소나 대화에서 확인할 수 없는 값은 한 번에 묶어 요청한다.
   - KP APP_ID: 사용자가 KP Developer Center에서 직접 확인해 제공해야 한다. 앱 ID를 추측하거나 다른 저장소에서 가져오지 않는다. DEV/PRD가 다르면 각 값을 받고, 같으면 양쪽 환경에 같은 값을 쓴다는 확인을 받는다.
   - Preview callback 설정에 필요한 환경별 `KP_SYSTEM_APP_ID`: `appSetApp`·`appGetApp` 요청의 query parameter `app_id`에 사용하는 값이며, 대상 KP 앱의 `KP APP_ID`와 구분합니다. API 계약에서 확인할 수 없으면 사용자에게 요청하고 추측하지 않습니다. callback 설정 변경이 작업 범위에 포함되지 않으면 요청하지 않습니다.
   - 로컬 OAuth callback: 기본값은 http://localhost:3000/auth/callback이다. 개발 서버 포트가 다르면 실제 URL을 받는다. localhost와 127.0.0.1은 서로 다른 redirect URI다.
   - DEV/PRD OAuth callback 및 Firebase 프로젝트 ID·Hosting 사이트 ID·도메인. 대상 저장소의 기존 Firebase 설정에서 확인할 수 없는 값만 환경별로 요청한다.
   - KP Developer Center 로그인 계정: API 문서 열람에 필요한 계정 이메일과 인증 수단의 로컬 참조를 AGENTS.local.md에서 확인합니다. 비밀번호·세션 쿠키·토큰은 그 파일에 기록하지 않습니다.
   - 확정 구조의 store/slices/와 모든 폴더명 단수 원칙이 충돌한다. 이 초기화에서 해당 경로가 필요하면 store/slice/로 바꿀지, 기존 경로의 예외로 둘지 확인한다.
3. VITE_APP_NAME은 package.json의 name에서 만들고, VITE_APP_DESCRIPTION은 package 설명·README·화면의 실제 목적에 맞춰 쓴다. 앱 이름 변환이 PascalCase인지 공백으로 구분한 이름인지 불명확하면 예시를 제시해 확인한다. 설명을 지어낼 근거가 없으면 사용자에게 목적을 묻는다.
4. AGENTS.local.md는 assets/templates/AGENTS.local.md를 바탕으로 GitHub/Git identity, 환경별 프로젝트 ID·Hosting target·`KP_SYSTEM_APP_ID`, 계정 이메일, 테스트 계정 이메일·역할, Secret Manager·Keychain 항목 이름처럼 비밀이 아닌 로컬 설정을 기록합니다. 실제 비밀번호·세션·액세스 토큰·API key·개인 키는 이 파일, 셸 설정, 저장소 파일에 넣지 않습니다. 실제 비밀은 OS Keychain 또는 조직 Secret Manager에 두고 필요한 명령의 프로세스에만 환경 변수로 주입합니다. AGENTS.local.md가 .gitignore에 포함되어 `git check-ignore -v AGENTS.local.md`로 확인되는지 검증합니다.
   - KP API 문서를 읽을 때는 Developer Center 계정 이메일과 인증 수단의 로컬 참조를 확인합니다. 정보가 없으면 사용자에게 필요한 항목만 요청하며 비밀번호를 입력받아 문서에 보관하지 않습니다.
   - Git identity나 GitHub 원격 인증, Firebase/GCP 작업, 로컬·개발 서버 테스트에 필요한 계정·권한·환경을 확인합니다. 로그인 계정과 프로젝트 권한은 서로 다르므로 403이나 IAM 오류가 나면 실제 주체·프로젝트·리소스·거부된 permission을 기록해 권한 관리자에게 필요한 최소 권한 수정을 안내합니다.

## 구현 기준

- `references/project-toolchain.md`를 먼저 읽고, 대상 앱에서 사용할 도구와 역할을 정합니다. 기준 프로젝트와 도구 종류는 맞추되 버전 숫자는 그대로 복사하지 않습니다. 대상 코드와 설정에 이미 있는 도구·버전을 조사해 호환되는 버전을 고르고, 도구를 바꾸거나 기존 대안을 제거해야 하면 사용자에게 먼저 설명하고 확인받습니다.
- 기준 도구는 React·React DOM, TypeScript, React Router DOM, TanStack React Query, Zustand, Zod, Tailwind CSS, Vite·React plugin, Biome, ESLint, Prettier입니다. Biome과 ESLint는 각 저장소에서 맡은 규칙을 확인해 사용하고, Biome formatter가 꺼져 있거나 Prettier가 기존 `format`·`check` 명령에 쓰이면 Prettier를 유지합니다. Radix primitive와 개발 보조 도구는 화면·소스에서 실제 필요성이 확인될 때만 추가합니다.
- 아래 확정 구조와 references/frontend-architecture.md의 계층 책임을 적용한다. 새로운 화면을 다시 디자인하지 말고 현재 화면, 콘텐츠, 컴포넌트를 구조에 매핑한다.
- 먼저 최신 KP 공식 API 문서를 읽고 docs/kp-api-analysis.md에 필요한 endpoint, HTTP method, 인증, app_id, 요청·응답 필드, 페이지네이션, 권한을 기록한다. 확인되지 않은 endpoint·필드·권한은 추측하지 않는다.
- KP API 문서는 [DEV Developer Center](https://developer-kpcenter-dev.web.app/api) 또는 [PRD Developer Center](https://developer-kpcenter.web.app/api)에서 해당 환경의 계약을 확인한다. 로그인 계정은 대상 저장소의 AGENTS.local.md에서 확인하고, 접속 전 활성 계정이 맞는지 검증한다.
- assets/templates/kpClient.ts를 src/api/kpClient.ts로, assets/templates/authentication.ts를 src/schema/authentication.ts로 추가한다. 기존 앱 구성과 충돌하는 import 경로만 실제 alias에 맞춰 조정한다. 해당 클라이언트가 요구하는 config/app와 Vite 환경 타입 선언을 조사해 없을 때만 보완한다.
- Zod가 없으면 저장소의 package manager를 확인해 런타임 의존성으로 추가한다. npm 저장소라면 npm i zod를 사용하고 lockfile을 함께 갱신한다.
- 기존 파일을 덮어쓰지 않는다. 같은 경로에 기존 코드가 있으면 소비자와 테스트를 확인하고 필요한 동작을 합친다.
- 화면 요청은 hook/query/에 TanStack Query key·query·mutation을 두고, 전역 클라이언트 상태는 store/의 Zustand에 둔다. 서버 응답을 Zustand에 중복 보관하지 않는다. 확정 구조에 없는 서비스 계층은 임의로 추가하지 않는다. 여러 API 호출로 이루어진 흐름도 우선 query/mutation에서 조정하되, 새 계층이 필요해 보이면 구조를 바꾸기 전에 사용자에게 묻는다.
- 초기화 결과를 넘기기 전에 references/plugin-skills.md를 읽고, 작업을 시작하기 전에 같은 프로젝트·에이전트 경로에 `kp-skill-manager` 전체가 있는지 확인합니다. 없으면 manager 설치가 필요한 이유와 경로를 설명하고 사용자 동의를 구합니다. 동의한 경우에만 manager의 세 Skill을 먼저 설치하고 결과를 확인합니다. 초기화가 끝나면 이미 설치된 파일과 사용자 변경을 확인한 뒤 `kp-app-api`, `kp-app-deploy`, `kp-app-deploy-dev`, `kp-app-deploy-prd`, `kp-app-preview-release`, `kp-app-preview-delete`, `kp-app-image-optimize` 중 누락된 Skill만 같은 프로젝트 경로에 설치합니다. `kp-api-skill`은 설치하지 않습니다. 거부하면 필요한 manager를 포함한 KP Skill 설치와 작업을 진행하지 않습니다. `--global` 또는 `-g`는 사용하지 않습니다. 설치 후 manager와 앱 Skill이 선택된 프로젝트·에이전트 경로에 있는지 검증합니다.
- `.agents/references/cloud-access.md`의 템플릿을 대상 저장소에 복사하고, 루트 `AGENTS.md`에서 해당 문서와 `AGENTS.local.md`를 읽도록 연결합니다. 기존 문서는 덮어쓰지 않고 필요한 규칙만 병합합니다.
- 이후 references/agent-ide.md를 읽고 초기화 대상 저장소에만 biome-eslint-ide-config-skill을 프로젝트 로컬로 설치하고 실행한다. 사용자의 전역 Skill 설치는 대상 저장소 설치를 대체하지 않는다. 그 스킬의 사용자 확인 절차와 전체 파일 자동 수정 승인 단계를 생략하지 않는다.
- 초기화할 때는 `package.json`, `firebase.json`, `.firebaserc`, `.env.development*`, `.env.production*`을 먼저 읽고 기존 설정을 보존하며 합친다. Vite 프로젝트의 `package.json`에는 `build:dev`와 `deploy:dev`를 반드시 추가한다. `build:dev`는 `vite build --mode development`를 실행하고, `deploy:dev`는 `npm run build:dev`를 먼저 실행한 뒤 확인된 실제 DEV Firebase 프로젝트 ID를 사용해 `firebase deploy --only hosting:dev --project <확인된 DEV 프로젝트 ID>`를 실행한다. PRD Firebase 프로젝트 ID와 Hosting 사이트 ID를 모두 확인하면 `build:prd`와 `deploy:prd`도 추가한다. `build:prd`는 `vite build --mode production`, `deploy:prd`는 `npm run build:prd` 후 확인된 PRD 프로젝트 ID로 `firebase deploy --only hosting:prd --project <확인된 PRD 프로젝트 ID>`를 실행한다. `<...>` 대체 문구를 스크립트에 남기지 않는다. 같은 이름의 기존 스크립트가 있으면 현재 동작을 확인해 합치고, 안전하게 합칠 수 없을 때만 사용자에게 선택을 요청한다.
- Node.js 버전은 `.nvmrc`, `.node-version`, `.tool-versions`, `package.json`의 `engines.node`, CI 설정을 확인해 기록합니다. 프로젝트가 버전을 고정하지 않았다면 에이전트 셸의 Node 버전을 프로젝트 기준으로 간주하지 않습니다. 대상 도구가 지원하는 범위와 현재 로컬 버전을 설명하고 사용자에게 고정 여부와 버전을 확인합니다. 사용자가 고정을 원하지 않으면 명세에 `미고정`이라고 기록합니다.
- 패키지 버전은 manifest 선언 범위와 lockfile의 정확한 설치 버전을 구분해 기록합니다. `^` 범위와 lockfile 버전이 달라도 lockfile 버전이 선언 범위에 포함되고 lockfile의 루트 dependency 명세가 manifest와 일치하면 정상입니다. 대상 저장소의 패키지 관리자를 유지하고 lockfile을 함께 갱신합니다. 확인 없이 버전 범위를 넓히거나 lockfile을 삭제·재생성하지 않습니다.
- Firebase Hosting 논리 타깃은 `dev`와 `prd`로 두고, `.firebaserc`에서 각 실제 Firebase 프로젝트의 타깃을 해당 환경 Hosting 사이트 ID에 연결한다. `kingdom-planet-dev`와 `kp-church-website-dev2`는 참조 저장소 값이므로 대상 앱에 복사하지 않는다. 프로젝트 ID와 Hosting 사이트 ID는 대상 저장소에서 확인하거나 사용자에게 받은 값만 사용한다.
- `firebase.json`은 `assets/templates/firebase.json`을 기준으로 `dist` 출력, SPA rewrite, 캐시 헤더를 설정한다. 기존 Hosting 설정이 있으면 덮어쓰지 말고 합친다. `.firebaserc`가 없을 때만 `assets/templates/.firebaserc.example`을 기반으로 확인된 프로젝트·사이트 값을 채워 생성한다.
- DEV와 PRD 설정을 함께 다룰 때 각 환경은 해당 환경의 Firebase 프로젝트 ID, Hosting 사이트 ID, Vite mode, Hosting 도메인을 개별 연결한다. 프로젝트별 Hosting 사이트 이름을 추측하거나 다른 앱의 값을 재사용하지 않는다.
- Git 커밋, push, PR 생성·병합은 `.agents/references/commit-rule.md`와 `.agents/references/pr-rule.md`의 승인·완료 절차를 따른다. 메시지 발송, 결제, 실제 데이터 변경, Firebase Hosting 배포는 사용자가 해당 작업을 별도로 명시적으로 요청하기 전에는 하지 않는다. 그 밖에는 작업 범위와 직접 연결된 테스트·빌드만 수행한다.

## 마무리

초기화, 코드 연결, 로컬 검증이 끝나면 대상 저장소에서 /init을 실행한다. 생성된 결과를 확인하고 아래 문서 계약에 맞게 보완한다.

- 루트 AGENTS.md에 실제 폴더 트리를 그리고 .agents/references/의 상세 문서와 하위 AGENTS.md로 연결한다.
- 생성하는 루트 `AGENTS.md`에는 작업마다 최소한 `main`/`dev`가 아닌 별도 작업 브랜치를 사용하고, 권장 방식은 작업별 워크트리와 브랜치를 함께 만드는 것이라고 명시한다. `main`/`dev`에 직접 push하려면 push 직전에 매번 사용자의 명시적 승인을 받도록 한다. GitHub 원격 인증 계정과 Git 커밋 identity가 같은 사용자 계정이어야 하며, `AGENTS.local.md`에 정한 author·committer 이름과 이메일을 커밋 전에 확인하도록 명시한다. author와 committer 이메일은 모두 해당 GitHub 계정에 인증된 이메일 또는 그 계정의 noreply 주소여야 한다.
- 생성하는 루트 `AGENTS.md`에는 모든 작업을 기능·수정 목적별 맥락으로 나누고, 각 맥락의 구현과 직접 검증이 끝날 때마다 독립 커밋으로 남긴다고 명시한다. 작업 완료는 확인된 base를 대상으로 PR을 만들고 필요한 검사와 리뷰가 끝난 뒤 PR을 base에 병합해야 완료된다고 명시한다. PR 없이 브랜치를 base에 직접 병합하는 작업은 사전에 사용자의 명시적 승인을 받도록 한다.
- `assets/templates/.agents/references/commit-rule.md`와 `pr-rule.md`를 각각 대상 저장소의 `.agents/references/commit-rule.md`와 `pr-rule.md`로 복사하고, `assets/templates/.references/PULL_REQUEST_TEMPLATE.md`를 대상 저장소의 `.references/PULL_REQUEST_TEMPLATE.md`로 복사한다. 같은 경로의 기존 문서가 있으면 덮어쓰지 말고 내용을 합친다.
- 루트 `AGENTS.md`에서 `.agents/references/commit-rule.md`, `.agents/references/pr-rule.md`, `.references/PULL_REQUEST_TEMPLATE.md`로 연결합니다. 세부 규칙은 해당 참조 문서에 두고 `AGENTS.md`에는 라우팅 링크를 유지합니다. 이 플러그인의 프로젝트 로컬 Skill 설치 경로를 확인해 `kp-app-init`은 초기화·구조 작업에, 환경을 지정하지 않은 `kp-app-deploy`는 기본 DEV 배포에, `kp-app-deploy-dev`와 `kp-app-deploy-prd`는 각각 해당 환경을 고정한 slash 호출에, `kp-app-api`는 새 KP API 기능 연동·기존 연동 수정에, `kp-app-preview-release`와 `kp-app-preview-delete`는 각각 요청된 Preview 배포와 검토 완료 후 정리에 사용하도록 안내합니다.
- 각 주요 소스 계층에 해당 코드의 실제 지도와 책임을 담은 AGENTS.md를 만든다. 경로는 최소한 src/api/, src/schema/, src/type/, src/store/, src/hook/, src/provider/, src/router/, src/component/, src/page/, src/config/, src/util/을 조사한다.
- 루트와 참조 문서에는 모든 새 폴더명·함수명·변수명을 단수로 짓는 Dixsoft 원칙을 기록한다. 배열 등 집합 변수는 userList, memberMap처럼 단수 도메인명 뒤에 자료형 의미를 붙인다. KP wire 필드·endpoint, 외부 라이브러리 계약은 바꾸지 않는다.
- `assets/templates/.agents/references/spec.md`를 대상 저장소의 `.agents/references/spec.md`로 복사하고 실제 프로젝트 값으로 채웁니다. 런타임과 패키지 관리자, 직접 의존성의 선언 범위와 잠금 버전, 도구 역할, build·lint·format·test 명령, Node.js 고정 여부를 기록합니다. lockfile이나 런타임 선언이 없는 값은 추측하지 말고 `미고정` 또는 `없음`으로 적습니다. 마지막으로 루트 `AGENTS.md`에서 이 명세를 연결하고 모든 작업자가 기술 스택·Node·패키지 버전 변경 전에 읽고 변경 뒤 함께 갱신하도록 명시합니다.
- 빌드, 테스트, 정적 분석 결과와 실제 DEV OAuth·주요 읽기 동작 결과를 나누어 보고한다. 실제 브라우저 동작을 확인하지 못했으면 코드 수준 검증과 구분해 적는다.

## 필요한 상세 자료

- 인증·API·저장소 경계: [references/kp-api-and-security.md](references/kp-api-and-security.md)
- 프론트엔드 아키텍처 계약: [references/frontend-architecture.md](references/frontend-architecture.md)
- 기준 도구 모음과 버전 기록 원칙: [references/project-toolchain.md](references/project-toolchain.md)
- 이 플러그인의 전체 Skill 프로젝트 로컬 설치: [references/plugin-skills.md](references/plugin-skills.md)
- 새 KP API 기능의 계약 확인과 기존 앱 연동: [프로젝트 로컬 `kp-app-api` Skill](../kp-app-api/SKILL.md)
- 에이전트별 IDE 스킬 설치와 실행: [references/agent-ide.md](references/agent-ide.md)
- 새 앱 파일로 복사할 코드: assets/templates/

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | KP 앱 API | 새 앱의 endpoint 계약을 환경별로 확인합니다. | [DEV Developer Center](https://developer-kpcenter-dev.web.app/api/), [PRD Developer Center](https://developer-kpcenter.web.app/api/)의 해당 endpoint 문서 |
| API | `appGetApp`·`appSetApp` | Preview callback readback·변경에 사용합니다. `appSetApp`은 명시적으로 승인된 경우에만 호출합니다. | [`appGetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appGetApp-/v2/app/), [`appSetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appSetApp-/v2/app/edit) |
| API | Firebase Auth redirect domain | OAuth redirect의 authorized domain 설정을 확인합니다. | [authorized domain 안내](https://firebase.google.com/docs/auth/web/redirect-best-practices) |
| CLI | Git·npm·Vite | 상태·ignore 확인은 `git status --short --branch`, `git check-ignore -v AGENTS.local.md`입니다. npm 설치는 `npm install zod`, build는 `vite build --mode development` 또는 `vite build --mode production`, scripts는 `npm run build:dev`, `npm run deploy:dev`, 필요 시 `npm run build:prd`, `npm run deploy:prd`입니다. | [git status](https://git-scm.com/docs/git-status), [git check-ignore](https://git-scm.com/docs/git-check-ignore), [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install), [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script), [Vite CLI](https://vite.dev/guide/cli) |
| CLI | Firebase CLI | 생성하는 deploy script는 `firebase deploy --only hosting:dev --project <DEV_FIREBASE_PROJECT_ID>` 또는 `firebase deploy --only hosting:prd --project <PRD_FIREBASE_PROJECT_ID>`입니다. | [Firebase CLI](https://firebase.google.com/docs/cli) |
| CLI | Skills CLI | 설치가 승인되면 manager를 먼저 `npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills --skill '*' --agent <AGENT> --copy --yes`, 앱 Skill은 `npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills --skill <SKILL_NAME> --agent <AGENT> --copy --yes`로 설치합니다. | [Skills CLI commands](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) |
| 기타 | React·TypeScript·Zod·TanStack Query·Zustand·lint·format·브라우저 | 대상 저장소 설정을 확인하고 Developer Center·브라우저 작업은 프로젝트의 브라우저 규칙을 따릅니다. | — |

## KP Skill 관계와 관리자 설치

- 이 Skill을 프로젝트에서 사용할 때는 동일한 프로젝트·에이전트 경로에 `kp-skill-manager`의 세 Skill이 있는지 확인합니다. 없으면 manager의 역할과 필요한 설치 경로를 설명하고 설치 동의를 받은 뒤에만 manager 전체를 프로젝트 로컬로 설치합니다. 거부하면 KP Skill 작업을 진행하지 않습니다. 사용자가 manager 설치를 직접 요청한 경우는 설치 동의로 봅니다.
- 다른 KP Skill이 필요해지면 아래 정본 문서 또는 현재 에이전트의 `.agents/skills/kp-skill-install/references/`나 `.claude/skills/kp-skill-install/references/`에 있는 관계표를 읽습니다. 필요한 Skill이 없으면 이유와 이름을 알리고 추가 설치 동의를 구합니다. 동의한 Skill만 설치하며 관계표의 모든 Skill을 무조건 실행하지 않습니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-app-init/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-app-init/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 초기화 후 설치 범위는 [플러그인 안내](../../README.ko.md)를 확인합니다.
- 정본 관계표: `kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md`.
