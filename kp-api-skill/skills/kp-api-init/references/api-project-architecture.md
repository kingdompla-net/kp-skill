# `kingdom-planet-api-fb` 코드베이스 패턴 분석

이 문서는 `kingdom-planet-api-fb`의 여러 도메인과 공통 실행 코드를 읽고 추린 패턴을 정리합니다. 특정 프로젝트 ID, 데이터베이스 이름, API key, queue, service account, secret, region은 새 API에 복사하지 않습니다. 새 저장소의 실제 contract와 운영 요구를 먼저 확인하고 아래 패턴이 맞는지 검증합니다.

## 저장소와 배포 구조

- 루트 `firebase.json`은 `app`, `auth`, `event`, `payment`, `qt` 등 여러 도메인을 별도 Firebase Functions `codebase`로 관리합니다. 각 codebase의 predeploy 단계는 `@kp/common` 동기화와 해당 도메인의 lint를 실행합니다.
- 도메인 폴더는 대체로 `index.js`, `function/`, `database/`, 필요에 따른 `common/`, `test/`, `package.json`으로 나뉩니다. `function/`은 endpoint 또는 trigger handler를, `database/`는 Firestore 접근을 맡는 경우가 많지만 오래된 codebase에는 예외가 있으므로 실제 import 경로를 따라갑니다.
- 공유 구현은 루트 `common/`에 있고, 도메인별 `prepare:common` 스크립트가 이를 동기화합니다. 공유 helper를 고칠 때 루트 파일과 복제본을 동시에 직접 편집하지 말고 동기화 계약과 predeploy 동작을 확인합니다.
- API 추가 때마다 Firebase codebase를 만들지 않습니다. 기존 도메인의 책임에 속하는 HTTP route는 기존 router에 추가하고, 독립 권한·실행 시간·retry·스케줄 경계가 필요한 함수만 별도 export로 둡니다.
- 저장소 루트의 `deploy-functions:dev`와 `deploy-functions:prd`는 현재 모든 Functions를 대상으로 합니다. 기능 하나를 검증하거나 배포할 때 이 넓은 script를 그대로 실행하지 않습니다.
- codebase별 `package.json`에도 `deploy` script가 있지만 모든 값이 정확하지는 않습니다. 현재 `payment` script는 `functions:class`, `mentoring` script는 `functions:app`을 대상으로 합니다. 기존 script 이름만 믿지 말고 config, export, project와 실제 명령 인수를 대조합니다.

## HTTP router와 공통 request 계약

- 여러 도메인은 `common/apiUtil.js`의 `onApiHttp`로 router를 구성하고 `/v2/<domain>` prefix 아래에서 handler를 연결합니다. `app/index.js`, `auth/index.js`, `event/index.js`, `qt/index.js`에서 router 등록과 export 구조를 비교할 수 있습니다.
- `onApiRequest`는 CORS preflight, 공통 인증, app ID 검사, route log context, 오류 처리와 `{ code, is_ok, data }` 응답을 제공합니다. 기본값은 인증 필수, 앱 멤버십 필수, app ID 필수입니다. route별 옵션을 바꾸려면 실제 endpoint 필요에 근거해야 합니다.
- `onApiHttp` route는 method와 path가 명시된 경우 그 조합으로 매칭합니다. route의 auth 옵션과 handler의 실제 입력 검증을 함께 확인합니다.
- 공통 `validateRequest`는 Yup schema로 입력을 검증하고 실패 시 `KPError('Bad Request', 400)`으로 바꿉니다. 다수 endpoint는 `.noUnknown().strict()` schema를 사용하지만 오래된 handler에는 검증 방식이 다르므로 코드베이스별 일관성을 우선합니다.
- HTTP 요청 정보에는 인증된 사용자, app ID, scope, body, route params 등이 들어갑니다. 권한을 확인하기 전에 입력값만으로 대상 사용자를 정하거나 API key의 모든 권한을 사용자 권한처럼 취급하지 않습니다.

## 함수 유형과 책임 분리

| 유형 | 저장소에서 확인한 예 | 스킬 적용 기준 |
| --- | --- | --- |
| 동기 HTTP router | `appRouter`, `eventRouter`, `qtRouter` | 짧은 요청·응답은 도메인 router에 handler로 추가합니다. |
| Callable function | `auth`와 `payment`의 `onCall` handler | Firebase callable 계약, 인증 context, 오류 코드가 필요할 때 기존 callable 패턴을 따릅니다. |
| Cloud Tasks worker | `qtCrawlWorker` | 요청을 즉시 끝낼 수 없거나 독립 retry·queue 경계가 필요할 때만 둡니다. |
| Scheduler 또는 event trigger | `batch`, `comm`, `event`, `qt` | 정기 실행이나 데이터/event 기반 실행에 사용하고 중복 실행과 부작용을 다룹니다. |
| 직접 HTTPS·외부 연동 | 일부 `media` 처리 및 callback | router 공통 계약과 다른 공개 방식이나 장기 작업이 필요한 근거를 확인합니다. |

`qt`는 router, Cloud Tasks worker, Scheduler가 한 도메인 안에 공존하는 사례입니다. 그러나 그 형태를 모든 API에 복사하지 않습니다. QT의 `/daily/run`과 `/daily/run/status`는 내부 server-to-server 작업을 위한 endpoint이며, 공개 Developer Center 문서에서는 PR #52에서 제거됐습니다.

## 데이터·인증·비밀의 경계

- `common/admin.js`는 일반 Firestore 접근과 API DB를 구분합니다. `apiUtil`은 app 설정과 key 검증에 control DB를 사용하고, 도메인별 데이터 helper는 `apiDb`를 쓰는 경우가 많습니다. 새 codebase의 실제 데이터 소유권과 database ID를 검증합니다.
- `onApiRequest`의 옵션에는 `isRequireAuth`, `isOnlyMember`, `isRequireAppId`, `isRefreshToken`, `isCallback` 등이 있습니다. 기본 인증 여부를 바꾸거나 callback mode를 선택할 때 caller와 권한 검증 경계를 테스트합니다.
- API key는 서버 간 요청에만 사용합니다. 사용자 bearer token, app membership, API key, app ID와 scope는 서로 다른 계약이므로 필요한 조합을 문서화합니다.
- Functions secret은 해당 함수 export에만 연결하고 Firebase Secret Manager에서 관리합니다. browser bundle, `.env` 추적 파일, URL query, log, PR에 secret을 넣지 않습니다.
- `function/`에서 Firestore update 외에 email, SMS, push, 결제, 외부 AI·번역, 미디어 변환을 호출하는 codebase도 있습니다. 이 부작용은 unit test에서 mock 처리하고 emulator에서 외부 API가 실제 호출되지 않도록 보호합니다.

## 테스트와 운영 확인

- 테스트 구조와 명령은 도메인마다 다릅니다. 대부분 Mocha를 사용하지만 일부는 Node `node:test`이며, `qt`에는 HTTP/worker unit test와 별도 Firestore emulator test가 있습니다. 설치된 테스트 runner와 실제 `test/` 내용을 확인한 뒤 사용합니다.
- 파일 수나 테스트 개수만으로 도메인 coverage를 단정하지 않습니다. 예를 들어 `media` 테스트 경로에는 다른 도메인 테스트가 들어 있고, 여러 codebase는 테스트가 없거나 매우 제한적입니다. 수정한 contract와 오류 경로를 직접 검증합니다.
- 루트 `firebase.json`의 Functions emulator 설정만으로 Firestore, Auth, Storage, Messaging 등 모든 의존성이 격리된다고 보장할 수 없습니다. 에뮬레이트하지 않는 Firebase 제품은 실제 project resource에 연결될 수 있습니다. 테스트는 demo project ID와 필요한 emulator를 함께 쓰고, 지원되지 않는 외부 서비스는 stub/mock으로 대체합니다.
- 현재 `test*Router` export는 `onApiHttp(...).test`를 별도 함수 이름으로 export합니다. `common/admin.js`는 이 요청에서 API DB를 `kp-test-api-db`로, 일반 DB를 `kp-test-db`로 바꾸고 test API key를 사용합니다. 다만 app 설정은 control DB에서 읽고 Firebase Auth, Storage, Messaging client는 같은 Firebase project를 사용하므로 완전한 sandbox로 간주하지 않습니다.
- 테스트 전용 export는 같은 Firebase Functions project에 실제 배포되는 Cloud Functions입니다. `.firebaserc`에는 `dev`와 `prd`만 있고 별도의 test project alias는 없습니다. 따라서 `test*Router` URL을 가상 emulator나 비용·부작용 없는 환경으로 소개하지 않습니다.

## API 문서의 공개 범위

- API 계약의 근거는 router 등록, handler schema, 공통 middleware, test, 배포 대상의 실제 코드에서 찾습니다. QT 한 사례만으로 필드와 인증을 추측하지 않습니다.
- Center의 `src/kp-dev/data/api-docs-v2.json`은 API 메뉴와 상세 화면에서 사용하는 자료입니다. PR #50은 QT 일일 조회와 당시의 작업 endpoint 설명을 추가했고, PR #51은 API detail 렌더링의 빈 URL 처리와 데이터를 고쳤으며, PR #52는 `/v2/qt/daily/run`과 `/v2/qt/daily/run/status`의 server-to-server 작업 설명을 공개 문서에서 제거했습니다.
- 배포된 모든 Cloud Function을 문서에 싣지 않습니다. KP 개발자나 trusted backend만 사용하는 작업·관리 endpoint, worker, Scheduler와 내부 운영 API는 공개 catalog에 노출하지 않습니다. 제품 기능으로 공개할 API만 정확한 인증과 요청·응답 contract를 문서화합니다.
- 현재 Center repo의 `dev` branch는 Firebase Hosting Preview Channel을 사용해 검토할 수 있습니다. Preview URL의 callback allowlist는 Firebase Auth authorized domain과 혼동하지 않습니다. Center OAuth 흐름은 API가 `oauth_redirect_uri_list`를 검증하므로 정확한 앱 설정과 정리 절차를 따릅니다.

## 새 API에 적용하는 원칙

1. 저장소 root, active branch, clean/dirty files, Firebase configs, codebase, existing route, auth wrapper, schema validator, test runner와 package scripts를 먼저 읽습니다.
2. 새 endpoint는 기존 codebase의 route에 붙이고, 동기 HTTP가 아닌 구체적 이유가 있을 때만 worker·callable·trigger export를 추가합니다.
3. codebase별 npm script는 target, config, project, `--only` 범위가 실제 일치하는지 검증합니다. 잘못된 기존 script를 복사하지 않습니다.
4. emulator와 unit tests를 먼저 통과시키고, 별도 격리 project가 확인되지 않으면 DEV/PRD의 `test*Router`를 테스트 대안으로 사용하지 않습니다.
5. 실제 배포는 [`kp-api-deploy`](../../kp-api-deploy/SKILL.md), 격리된 테스트 배포와 emulator는 [`kp-api-test-deploy`](../../kp-api-test-deploy/SKILL.md), 배포 완료 후 공개 계약 문서는 [`kp-api-docs`](../../kp-api-docs/SKILL.md)에 맡깁니다.

공식 참고 자료: [Firebase Functions 배포](https://firebase.google.com/docs/functions/manage-functions), [Functions codebase 구성](https://firebase.google.com/docs/functions/organize-functions), [Cloud Functions 로컬 emulator](https://firebase.google.com/docs/functions/local-emulator), [Local Emulator Suite의 demo project](https://firebase.google.com/docs/emulator-suite/connect_functions).
