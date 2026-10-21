# Firebase Hosting 배포 기준

초기화된 KP 앱의 배포는 `kp-church-website`에서 사용하는 Firebase Hosting 흐름을 따르며 DEV와 PRD를 구분한다. 각 앱은 자기 환경별 Firebase 프로젝트와 Hosting 사이트 설정을 사용한다.

## DEV

- 빌드 명령은 `npm run build:dev`이며 `vite build --mode development`를 실행한다.
- 배포 명령은 `npm run deploy:dev`이며 `npm run build:dev` 실행 후 다음 명령으로 DEV Hosting만 배포한다.
- `kp-app-init`은 앱 `package.json`에 `build:dev`와 실제 DEV 프로젝트 ID를 포함한 `deploy:dev`를 생성한다. 배포 전 두 스크립트가 이 기준과 일치하는지 검증한다.

~~~sh
firebase deploy --only hosting:dev --project <DEV_FIREBASE_PROJECT_ID>
~~~

- `firebase.json`의 Hosting 설정은 논리 타깃 `dev`와 빌드 출력 `dist`를 사용한다.
- `.firebaserc`는 대상 DEV Firebase 프로젝트의 `targets.<project-id>.hosting.dev`에 그 프로젝트의 실제 Hosting 사이트 ID를 연결한다.
- 배포 전에 스크립트가 지정 프로젝트와 `hosting:dev`만 대상으로 하는지 확인한다. 스크립트가 없거나 범위가 다르면 설정을 임의로 우회하지 말고 누락 또는 불일치를 보고한다. 앱의 배포 스크립트를 바로잡는 작업이 요청된 경우에만 기존 `package.json` 동작을 보존하며 수정한다.

## PRD

PRD 배포는 사용자가 명시적으로 요청하고 PRD 프로젝트 ID, Hosting 사이트 ID, 도메인, production 빌드 명령을 대상 저장소 설정에서 확인한 경우에만 진행한다.

- 빌드 스크립트는 `npm run build:prd`이며 `vite build --mode production`을 실행한다.
- 배포 스크립트는 `npm run deploy:prd`이며 먼저 `npm run build:prd`를 실행한 뒤 아래 명령으로 PRD Hosting만 배포한다.

~~~sh
firebase deploy --only hosting:prd --project <PRD_FIREBASE_PROJECT_ID>
~~~

`prd` Hosting 타깃은 PRD 프로젝트의 실제 사이트 ID에 연결해야 하며 DEV 프로젝트·사이트 설정을 재사용하지 않는다. 실행 전에 빌드 모드, 프로젝트, 배포 범위가 모두 맞는지 확인한다. 필수 설정이나 스크립트가 없으면 값을 만들어 추정하지 말고 누락을 보고한다.

## 공통 확인

- `--project`에는 요청 환경의 실제 Firebase 프로젝트 ID를 명시한다.
- `firebase.json`의 요청 Hosting 타깃과 `.firebaserc`의 해당 프로젝트 사이트 연결이 일치하는지 확인한다. 타깃이 연결하는 사이트 ID는 해당 프로젝트의 실제 Hosting 사이트 목록과 대조한다.
- 저장소의 기존 rewrite, headers, output 경로, 캐시 설정은 배포 전에 읽고 의도치 않게 바꾸지 않는다.
- `--only hosting:<target>`으로 배포 범위를 제한한다. Functions, Firestore, Storage 등 다른 Firebase 제품을 함께 배포하지 않는다.
- Firebase CLI 배포 성공과 배포 도메인의 HTTP 응답 확인을 각각 기록한다. HTTP 확인 실패를 CLI 성공으로 덮어쓰지 않는다.
