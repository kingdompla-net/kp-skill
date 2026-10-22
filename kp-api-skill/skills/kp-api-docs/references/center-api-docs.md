# Developer Center API Docs 구조와 검토 근거

## 로컬 작업 위치

- 저장소는 `kingdompla-net/kingdom-planet-center`입니다. 로컬 clone의 Git remote와 branch를 확인하고, 직접 GitHub 파일 편집 API를 사용하지 않습니다.
- 공개 Developer Center 문서는 DEV [https://developer-kpcenter-dev.web.app/api/](https://developer-kpcenter-dev.web.app/api/)와 PRD [https://developer-kpcenter.web.app/api](https://developer-kpcenter.web.app/api)로 나뉩니다. 문서 변경은 확인된 API 배포 환경에 대응하는 경로에 반영합니다.
- Developer API catalog는 `src/kp-dev/data/api-docs-v2.json`에 있습니다. API detail 화면은 `src/kp-dev/page/api/[api].vue`에서 이 데이터를 화면 형식으로 매핑합니다.
- Firebase Hosting 설정과 `.firebaserc`에서 각 환경의 Firebase project 및 실제 Hosting site/target을 확인합니다. 검토 Preview는 DEV Firebase project의 `developer-kpcenter-dev` site/target에만 배포하고, 다른 Hosting target이나 PRD live channel을 사용하지 않습니다.
- Center 저장소 `dev`가 오래된 checkout이거나 dirty하면 변경을 덮지 않습니다. `origin/dev`를 기준으로 별도 worktree를 준비하거나 기존 상태를 유지하면서 사용자에게 확인합니다.

## PR #50, #51, #52

- PR #50은 QT codebase의 API catalog에 `/v2/qt/daily`, `/v2/qt/daily/run`, `/v2/qt/daily/run/status` 정보를 추가했습니다. 이 PR은 API docs JSON의 실제 row 필드를 읽을 근거입니다.
- PR #51은 `/api/<category>` 상세 화면에서 optional checkout URL이 비어 있어도 오류가 나지 않도록 URL parsing을 보완했습니다. API Docs 변경에서 renderer가 입력 데이터를 실제로 처리하는지 검증해야 하는 근거입니다.
- PR #52는 `/v2/qt/daily/run`과 `/v2/qt/daily/run/status` 문서를 catalog에서 제거했습니다. 두 endpoint는 crawl 작업 실행·상태 확인용 server-to-server API였기 때문에 public developer catalog에서 감추는 경계를 보여 줍니다.

## 공개 catalog 작성 원칙

- API router에서 실제 외부 사용을 의도한 public contract만 선택합니다. internal queue operation, Scheduler, worker, maintenance endpoint, 관리자 기능은 기본적으로 제외합니다.
- `api-docs-v2.json`의 현재 구조, 기존 codebase/category, 정렬 방식과 renderer가 요구하는 필드를 보존합니다. JSON 문법과 function name뿐 아니라 path와 auth 설명을 API handler에 대조합니다.
- 사용자 API key, 실제 bearer token, 개인 이메일, 실제 app ID, 운영 URL을 문서 예제로 쓰지 않습니다. 요청과 응답은 합성 예시를 사용합니다.
- center repo에 API docs schema나 build validation이 추가되기 전에는 Skills가 별도 생성기나 자동 codegen contract를 만들어내지 않습니다. 수작업 JSON은 source handler와 tests로 검증합니다.

## Preview OAuth callback 관리

- `src/kp-dev/composable/useAuth.ts`는 현재 browser origin의 `/auth/callback`을 KP OAuth authorize 요청의 `redirect_uri`로 사용합니다. callback 페이지도 `getSignInToken`에 같은 URL을 보냅니다.
- `kingdom-planet-api-fb/auth/function/authGetSignInToken.js`는 요청 URL을 app의 `oauth_redirect_uri_list`와 비교합니다. Firebase Auth `authorizedDomains` 목록과 다른 애플리케이션 수준 callback allowlist입니다.
- Center `src/kp-dev`에서 `oauth_redirect_uri_list`를 편집하는 화면은 로컬 검색에서 확인되지 않았습니다. 임시 callback은 승인된 Developer Center/app 설정 경로나 관리 권한이 있는 절차를 사용합니다. API key 또는 Firestore 직접 쓰기를 새 도구에서 임의 구현하지 않습니다.
- 추가할 값은 Preview URL의 origin이 아니라 정확한 callback `https://<preview-host>/auth/callback`입니다. 변경 전 기존 목록을 기록하고, 검토 종료 후 이번 실행에서 추가한 값만 제거합니다.
- Firebase Hosting CLI preview deploy가 Auth authorized domain을 추가·동기화하는지 CLI 문서와 실제 실행 옵션을 확인합니다. 바뀐 항목이 있으면 원본 상태와 분리해 기록하며 기존 도메인은 삭제하지 않습니다.
- Preview channel은 기본 7일 만료지만 이 작업은 `--expires 1d`로 제한합니다. 사용자가 검토를 마친 후 `firebase hosting:channel:delete <채널-ID>`를 실행하고, Firebase가 채널·release·version 삭제를 최대 24시간 안에 예약할 수 있음을 알립니다. Callback과 이번 실행에서 추가된 authorized domain은 별도로 제거합니다.

## 공식 Firebase 참고 자료

- [Firebase Hosting live/preview channel의 만료와 삭제](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- [Preview URL의 공개 범위와 backend 연결](https://firebase.google.com/docs/hosting/test-preview-deploy)
- [Firebase Hosting 다중 site와 deploy target](https://firebase.google.com/docs/hosting/multisites)
