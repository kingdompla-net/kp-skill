# KP API 테스트 환경 구성 기준

## 환경 유형

| 환경 | 실제 GCP 리소스 | 사용 목적 | 기본 허용 범위 |
| --- | --- | --- | --- |
| Unit test | 사용하지 않습니다. | 입력 검증, 인증 결정, handler 분기, 오류 응답, 데이터 변환을 빠르게 검증합니다. | 기본 실행 경로입니다. 외부 API와 DB는 mock/stub 처리합니다. |
| Local Emulator Suite | 로컬 emulator만 사용합니다. `demo-` project ID를 권장합니다. | HTTP Functions, Firestore/Auth/Storage 등 지원 제품과 trigger 상호작용을 검증합니다. | 기본 통합 테스트 경로입니다. |
| Dedicated test Firebase project | test 전용 cloud 리소스를 사용합니다. | IAM, deploy, cloud queue와 실제 SDK 연동이 필요할 때 제한적으로 검증합니다. | 실제 test project와 서비스 격리가 문서로 확인되고 사용자가 원격 배포를 요청한 경우만 사용합니다. |
| `test*Router` export | 현재 `dev` 또는 `prd` project에 배포된 Functions일 수 있습니다. | 코드베이스에서 구현된 test DB route를 확인할 때 사용합니다. | 완전 격리 환경이 아닙니다. 기본 검증 수단으로 쓰지 않습니다. |

## Local Emulator Suite 사용 원칙

- Firebase 공식 문서는 demo project를 우선 권장합니다. demo project에는 실제 Firebase 리소스가 없으므로 실행 코드가 emulator를 벗어나도 실데이터를 바꾸거나 과금 리소스를 호출하지 않습니다.
- 실제 project ID로 emulator 일부만 실행하면 실행하지 않은 Firebase 제품은 해당 실제 project의 자원을 사용할 수 있습니다. project alias가 `dev`나 `prd`인 작업 디렉터리에서는 project ID를 명시하고 emulator 연결을 확인합니다.
- `firebase.json`의 `emulators` 항목을 읽어 Functions 외에 필요한 Firestore, Auth, Storage, Pub/Sub, Hosting emulator가 설정됐는지 확인합니다. 설정 파일의 서비스 목록과 실제 `connect*Emulator` 또는 Admin SDK host 연결을 함께 봅니다.
- Emulator는 IAM과 서비스 계정 권한을 완전히 재현하지 않으며, Cloud Tasks production dispatch와 정확히 같은 동작을 보장하지 않습니다. 이 차이는 테스트 결과에 분리해 적습니다.
- Secret은 비밀 없는 local fixture나 emulator override로 대체합니다. 실 secret 값 또는 ADC를 emulator process에 무심코 전달하지 않습니다. 사용한 command가 실제 Google API를 호출하는지 코드와 환경을 확인합니다.
- 포트 충돌, 잘못된 project ID, emulator 미기동, emulator host 누락이 있으면 테스트를 성공으로 보지 않습니다. smoke endpoint 확인 후 fixture와 테스트 실행이 끝나면 이번 실행에서 시작한 emulator만 종료합니다.

## `kingdom-planet-api-fb`에서 확인한 주의점

- root `firebase.json`에는 현재 Functions와 Hosting emulator 설정이 있지만 Firestore/Auth/Storage/Pub/Sub emulator 설정은 같은 파일에서 확인되지 않습니다. root `npm run serve`가 Functions emulator를 시작한다는 이유만으로 DB와 Auth가 격리됐다고 판단하지 않습니다.
- QT의 별도 Firestore emulator 테스트는 `demo-kp-qt-emulator` project와 고정 loopback host를 사용하고, ADC와 `FIREBASE_CONFIG`를 자식 프로세스에서 제거한 다음 실행 환경을 검사합니다. 이 설계 원칙은 참고할 수 있지만 JAR, credential, project 이름을 새 저장소에 복사하지 않습니다.
- `test*Router`는 분리된 함수 export이므로 Firebase Functions에 배포되는 cloud endpoint입니다. `common/admin.js`에서 Firestore와 API key를 test용으로 선택해도 `controlDb`와 Auth·Storage·Messaging이 분리된 것은 아닙니다.
- 현재 API `.firebaserc`에 `dev`와 `prd` alias만 확인되며, 별도 test project가 설정돼 있지 않습니다. 새 프로젝트가 test project를 요구하면 프로젝트 관리자와 사용자가 리소스, IAM, secret, Auth provider와 데이터 fixture를 먼저 준비해야 합니다.

## 전용 test project 확인 항목

원격 test 배포를 실행하기 전에 다음 항목을 `AGENTS.local.md`나 보호된 배포 설정에서 확인합니다. 이 파일에는 secret 값이 아닌 항목 이름과 principal만 적습니다.

- 정확한 test Firebase project ID와 DEV·PRD project ID가 서로 다른지 확인합니다.
- test Firestore, Auth tenant/user, Storage bucket, queue, secret, runtime service account와 외부 API 계정이 test 전용인지 확인합니다.
- 배포 principal과 배포 허용 function 범위가 최소한으로 제한됐는지 확인합니다.
- 외부 발송·결제·삭제가 mock 처리됐거나 전용 provider sandbox를 쓰는지 확인합니다.
- 실행 후 생성 데이터와 리소스의 정리 주체와 기한을 확인합니다.

하나라도 확인할 수 없으면 dedicated test project 배포를 보류하고 unit test와 Local Emulator Suite를 사용합니다.

## 공식 Firebase 문서

- [Cloud Functions 로컬 emulator](https://firebase.google.com/docs/functions/local-emulator): HTTPS, callable, task queue 및 지원되는 background trigger를 로컬에서 검증합니다.
- [Functions emulator 연결](https://firebase.google.com/docs/emulator-suite/connect_functions): 실제 Firebase project와 `demo-` project의 차이, emulator를 실행하지 않은 제품이 live resource에 연결될 수 있는 조건을 확인합니다.
- [Local Emulator Suite 설정](https://firebase.google.com/docs/emulator-suite/install_and_configure): `emulators:exec`와 project ID 설정을 확인합니다.
