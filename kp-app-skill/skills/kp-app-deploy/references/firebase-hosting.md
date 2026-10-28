# Firebase Hosting 배포 기준

모든 KP 앱의 Firebase Hosting 배포는 Hosting 전용 Firebase 프로젝트 `kp-app-k00001`을 사용합니다. 각 앱과 환경은 이 프로젝트 안에서 확인된 Hosting site ID와 `dev`·`prd` target으로 구분합니다. 앱의 Firebase SDK runtime project ID는 앱별 값을 유지하며 Hosting 배포 project로 사용하지 않습니다. 환경 없이 `kp-app-deploy`를 호출하면 DEV를 선택합니다. DEV와 PRD 배포는 각각 `kp-app-deploy-dev`와 `kp-app-deploy-prd` Skill로 분리되어 있습니다. Claude Code에서 프로젝트 로컬 Skill을 직접 설치했다면 `/kp-app-deploy-dev`와 `/kp-app-deploy-prd`, 플러그인으로 설치했다면 `/kp-app-skill:kp-app-deploy-dev`와 `/kp-app-skill:kp-app-deploy-prd`로 실행합니다. Codex에서는 각각 `$kp-app-deploy-dev`, `$kp-app-deploy-prd`로 호출하거나 `/skills`에서 선택합니다.

## 프로젝트와 사이트 선택

- `--project`에는 항상 `kp-app-k00001`을 지정합니다. Firebase CLI의 기본 프로젝트나 앱의 SDK 설정에서 project ID를 추론하지 않습니다.
- `firebase hosting:sites:list --project kp-app-k00001`로 실제 사이트를 확인하고, 대상 앱·환경과 연결된 site ID를 `.firebaserc`의 `targets.kp-app-k00001.hosting.<target>`에서 검증합니다.
- 같은 앱의 DEV와 PRD는 서로 다른 Hosting site ID에 연결합니다. PRD site가 없으면 PRD 배포를 설정하지 말고 소유자가 Hosting site를 준비할 때까지 중단합니다.
- `kp-app-k00001`은 Firebase Hosting용 프로젝트입니다. 배포는 Hosting 범위만 사용하며 앱의 API, Authentication, Firestore, Functions, Storage runtime project 설정은 변경하지 않습니다.
- target 또는 site ID가 없거나 여러 후보 중 대상이 불분명하면 기본 site로 배포하지 말고 앱별 site 매핑을 확인합니다. 아직 site가 생성되지 않았다면 프로젝트 소유자가 site를 준비할 때까지 중단합니다.
- 기존 앱에서 target이 다른 Firebase project를 가리키면 `kp-app-k00001`의 확인된 site로 target mapping과 deploy script를 갱신합니다. `.env*`의 runtime Firebase 설정은 유지합니다.

## DEV

- 빌드 명령은 `npm run build:dev`이며 `vite build --mode development`를 실행합니다.
- 배포 명령은 `npm run deploy:dev`이며 `npm run build:dev` 실행 후 DEV Hosting만 배포합니다.
- `kp-app-init`은 앱 `package.json`에 `build:dev`와 `kp-app-k00001`을 지정하는 `deploy:dev`를 생성합니다. 배포 전에 두 스크립트가 이 기준과 일치하는지 검증합니다.

~~~sh
firebase deploy --only hosting:dev --project kp-app-k00001
~~~

- `firebase.json`의 Hosting 설정은 논리 타깃 `dev`와 빌드 출력 `dist`를 사용합니다.
- `.firebaserc`는 `targets.kp-app-k00001.hosting.dev`에 대상 앱의 실제 DEV Hosting site ID를 연결합니다.
- 스크립트가 `kp-app-k00001`과 `hosting:dev`만 대상으로 하는지 확인합니다. 다른 project를 지정하거나 target mapping이 다르면 배포 전에 확인된 site ID로 `.firebaserc`와 `package.json`을 갱신하고 다시 검증합니다. 기존 build 동작과 다른 script는 보존합니다.

## PRD

`kp-app-deploy-prd`는 `kp-app-k00001` 안의 PRD Hosting site ID, 도메인과 production 빌드 명령을 대상 저장소 설정에서 확인하고 `npm run build:prd`를 실행합니다. 빌드가 통과해도 실제 Hosting 배포는 자동으로 이어가지 않습니다. 현재 프로젝트와 PRD 환경에 대한 사용자의 명시적 배포 승인을 받은 뒤에만 진행합니다. 사용자가 요청에서 승인 확인 없이 바로 배포하라고 명확하게 지시한 경우에만 별도 확인을 생략할 수 있습니다.

- 빌드 스크립트는 `npm run build:prd`이며 `vite build --mode production`을 실행합니다.
- 배포 스크립트는 `npm run deploy:prd`이며 먼저 production build를 실행한 뒤 PRD Hosting만 배포합니다. 실제 배포 전에는 `deploy:prd`가 검증된 PRD 프로젝트와 타깃을 지정하는지 확인합니다.

~~~sh
firebase deploy --only hosting:prd --project kp-app-k00001
~~~

`prd` Hosting target은 `kp-app-k00001` 프로젝트의 해당 앱 전용 PRD site ID에 연결해야 하며 DEV site를 재사용하지 않습니다. 필요한 설정이나 스크립트가 없으면 값을 추정하지 말고 누락을 보고합니다.

## 공통 확인

- `--project kp-app-k00001`을 항상 명시합니다.
- `firebase.json`의 요청 Hosting target과 `.firebaserc`의 `kp-app-k00001` site mapping이 일치하는지 확인합니다. site ID는 `firebase hosting:sites:list --project kp-app-k00001` 결과와 대조합니다.
- 저장소의 기존 rewrite, headers, output 경로와 캐시 설정을 배포 전에 확인하고 의도치 않게 바꾸지 않습니다.
- `--only hosting:<target>`으로 배포 범위를 제한합니다. Functions, Firestore, Storage 등 다른 Firebase 제품은 함께 배포하지 않습니다.
- Firebase CLI 배포 성공과 배포 도메인의 HTTP 응답 확인을 각각 기록합니다. HTTP 확인 실패를 CLI 성공으로 덮어쓰지 않습니다.
