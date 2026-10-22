# Firebase Hosting 배포 기준

초기화된 KP 앱은 앱별 Firebase 프로젝트와 Hosting 사이트 설정을 사용하며, DEV와 PRD를 엄격히 구분합니다. 환경 없이 `kp-app-deploy`를 호출하면 DEV를 선택합니다. DEV와 PRD 배포는 각각 `kp-app-deploy-dev`와 `kp-app-deploy-prd` Skill로 분리되어 있습니다. Claude Code에서 프로젝트 로컬 Skill을 직접 설치했다면 `/kp-app-deploy-dev`와 `/kp-app-deploy-prd`, 플러그인으로 설치했다면 `/kp-app-skill:kp-app-deploy-dev`와 `/kp-app-skill:kp-app-deploy-prd`로 실행합니다. Codex에서는 각각 `$kp-app-deploy-dev`, `$kp-app-deploy-prd`로 호출하거나 `/skills`에서 선택합니다.

## DEV

- 빌드 명령은 `npm run build:dev`이며 `vite build --mode development`를 실행합니다.
- 배포 명령은 `npm run deploy:dev`이며 `npm run build:dev` 실행 후 DEV Hosting만 배포합니다.
- `kp-app-init`은 앱 `package.json`에 `build:dev`와 실제 DEV 프로젝트 ID를 포함한 `deploy:dev`를 생성합니다. 배포 전에 두 스크립트가 이 기준과 일치하는지 검증합니다.

~~~sh
firebase deploy --only hosting:dev --project <DEV_FIREBASE_PROJECT_ID>
~~~

- `firebase.json`의 Hosting 설정은 논리 타깃 `dev`와 빌드 출력 `dist`를 사용합니다.
- `.firebaserc`는 대상 DEV Firebase 프로젝트의 `targets.<project-id>.hosting.dev`에 해당 프로젝트의 실제 Hosting 사이트 ID를 연결합니다.
- 스크립트가 지정 프로젝트와 `hosting:dev`만 대상으로 하는지 확인합니다. 스크립트가 없거나 범위가 다르면 설정을 임의로 우회하지 않고 누락 또는 불일치를 보고합니다. 배포 스크립트를 수정하는 작업이 요청된 경우에만 기존 `package.json` 동작을 보존하며 고칩니다.

## PRD

`kp-app-deploy-prd`는 PRD 프로젝트 ID, Hosting 사이트 ID, 도메인과 production 빌드 명령을 대상 저장소 설정에서 확인하고 `npm run build:prd`를 실행합니다. 빌드가 통과해도 실제 Hosting 배포는 자동으로 이어가지 않습니다. 현재 프로젝트와 PRD 환경에 대한 사용자의 명시적 배포 승인을 받은 뒤에만 진행합니다. 사용자가 요청에서 승인 확인 없이 바로 배포하라고 명확하게 지시한 경우에만 별도 확인을 생략할 수 있습니다.

- 빌드 스크립트는 `npm run build:prd`이며 `vite build --mode production`을 실행합니다.
- 배포 스크립트는 `npm run deploy:prd`이며 먼저 production build를 실행한 뒤 PRD Hosting만 배포합니다. 실제 배포 전에는 `deploy:prd`가 검증된 PRD 프로젝트와 타깃을 지정하는지 확인합니다.

~~~sh
firebase deploy --only hosting:prd --project <PRD_FIREBASE_PROJECT_ID>
~~~

`prd` Hosting 타깃은 PRD 프로젝트의 실제 사이트 ID에 연결해야 하며 DEV 프로젝트·사이트 설정을 재사용하지 않습니다. 필요한 설정이나 스크립트가 없으면 값을 추정하지 말고 누락을 보고합니다.

## 공통 확인

- `--project`에는 요청 환경의 실제 Firebase 프로젝트 ID를 명시합니다.
- `firebase.json`의 요청 Hosting 타깃과 `.firebaserc`의 해당 프로젝트 사이트 연결이 일치하는지 확인합니다. 타깃이 연결하는 사이트 ID는 해당 프로젝트의 실제 Hosting 사이트 목록과 대조합니다.
- 저장소의 기존 rewrite, headers, output 경로와 캐시 설정을 배포 전에 확인하고 의도치 않게 바꾸지 않습니다.
- `--only hosting:<target>`으로 배포 범위를 제한합니다. Functions, Firestore, Storage 등 다른 Firebase 제품은 함께 배포하지 않습니다.
- Firebase CLI 배포 성공과 배포 도메인의 HTTP 응답 확인을 각각 기록합니다. HTTP 확인 실패를 CLI 성공으로 덮어쓰지 않습니다.
