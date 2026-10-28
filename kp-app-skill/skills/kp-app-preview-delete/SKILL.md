---
name: kp-app-preview-delete
description: "검토가 끝났거나 PR이 병합된 KP 앱 Firebase Hosting Preview Channel과 이번 작업에서 추가한 OAuth callback을 확인해 정리할 때 사용합니다."
metadata:
  version: "1.1.0"
---

# KP 앱 Firebase Hosting 프리뷰 정리

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

검토가 끝난 앱 Preview Channel과 해당 배포를 위해 임시 등록한 OAuth callback을 정리합니다. 사용자 또는 적용 지침이 지정한 정리 범위만 처리합니다.

## 정리 시작 조건

- 적용되는 `AGENTS.md`에서 PR 병합 뒤 정리를 요구하면 해당 PR의 실제 병합을 확인한 뒤 실행합니다. 별도 검수 완료 요청을 기다리지 않습니다.
- 사용자가 PR 병합 전에 검토 완료나 정리를 명시한 경우에도 실행합니다.
- channel ID, 환경, Firebase project·site·target과 callback URL을 특정할 수 있는 Preview 배포 기록을 확인합니다. PR 제목이나 브랜치 이름만으로 channel이나 callback을 추측하지 않습니다.

## 시작 확인

1. 대상 저장소 루트, 적용되는 `AGENTS.md`, `AGENTS.local.md`, 현재 브랜치와 `git status --short --branch`를 확인합니다. `.agents/references/kp-app-preview-interface.md`의 환경별 Preview·`appSetApp` 인터페이스와 readback 방법을 확인합니다. 파일이 없으면 외부 Preview·앱 설정 변경을 시작하지 말고 해당 파일 또는 인터페이스 설명과 필요한 변수명·저장 위치를 사용자에게 요청합니다. 받은 값을 저장할 때는 지정된 Git 무시 경로만 사용하고, 보고에는 파일 경로와 변수명만 알립니다. 비밀값은 출력하거나 복사하지 않습니다.
2. Preview 배포 기록에서 정확한 환경, 고정 project `kp-app-k00001`, Hosting site와 target, channel ID, callback URL, 해당 callback을 이번 배포에서 새로 추가했는지를 확인합니다. 기록이 없으면 GitHub PR이나 작업 산출물과 설정 readback에서 자료를 찾습니다.
3. Firebase CLI 로그인 계정과 project 접근 권한을 확인하고, `firebase hosting:channel:list --site <SITE_ID> --project kp-app-k00001`을 실행합니다. channel이 실제 Preview인지, live channel이 아닌지, 이 배포의 channel인지 확인합니다. site·channel·callback 소유 관계가 모호하면 어떤 리소스도 삭제하지 말고 확인을 요청합니다.

## OAuth callback 정리

1. 이번 작업에서 추가한 사실을 기록으로 확인하고 현재 callback 설정을 readback합니다. 배포 전에 이미 존재했던 callback은 제거하지 않습니다. 현재 설정에 대상 callback이 없으면 이미 정리된 것으로 기록합니다.
2. 이번 Preview 때문에 추가된 정확한 callback만 제거합니다. 기존 callback 목록과 다른 앱 설정은 보존합니다. 변경은 `.agents/references/kp-app-preview-interface.md`에 정의된 절차로 수행하며, 인터페이스가 없거나 필드 계약이 확인되지 않으면 추측해 호출하지 않습니다.
3. callback 제거 후 설정을 다시 readback해 해당 URL이 빠지고 다른 callback이 유지되는지 확인합니다. 제거 결과를 확인하지 못하면 미완료로 보고하되, Firebase channel 정리는 별도로 진행할 수 있습니다.

## Preview Channel 삭제

1. 정확한 Hosting target을 지정해 channel 목록에서 대상 ID와 URL을 다시 확인합니다. channel이 이미 없으면 이미 삭제된 것으로 기록합니다. 목록에서 다른 channel이거나 `live`인 경우 삭제하지 않습니다.
2. 정확한 channel ID, target과 Firebase project를 명시해 해당 Preview Channel만 삭제합니다.

~~~sh
firebase hosting:channel:delete <CHANNEL_ID> --site <SITE_ID> --project kp-app-k00001
~~~

3. 같은 project와 target의 channel 목록을 다시 읽어 대상 channel이 더 이상 나타나지 않는지 확인합니다. Firebase는 삭제한 channel과 연결된 release·version의 정리를 24시간 이내에 예약하고 Preview URL도 비활성화합니다. 저장 데이터가 즉시 완전히 삭제됐다고 보고하지 않습니다.
4. channel 삭제에 실패하더라도 승인된 범위의 callback 정리는 마무리합니다. callback 정리에 실패해도 안전하게 특정한 channel 삭제는 별도 단계로 진행합니다. 각 작업 결과를 독립적으로 기록합니다.

## 완료 보고

환경, project·site·target, channel ID, callback URL, callback readback, channel 삭제와 목록 readback, CLI 오류, Preview URL의 접근 상태를 각각 보고합니다. Firebase가 예약한 24시간 내 정리와 즉시 확인한 channel 비노출 상태를 구분합니다. 실제 browser나 HTTP 확인을 하지 않았으면 완료로 표시하지 않습니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | `appGetApp`·`appSetApp` | callback을 readback하고 이번 작업에서 추가한 URL만 승인된 설정 변경으로 제거합니다. | [`appGetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appGetApp-/v2/app/), [`appSetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appSetApp-/v2/app/edit) |
| API | Firebase Auth `authorizedDomains` | 이번 Preview에서 추가한 domain만 정리합니다. | [redirect·authorized domain](https://firebase.google.com/docs/auth/web/redirect-best-practices) |
| CLI | Git | 상태를 `git status --short --branch`로 확인합니다. | [git status](https://git-scm.com/docs/git-status) |
| CLI | Firebase CLI | 사이트 목록: `firebase hosting:sites:list --project kp-app-k00001`<br>channel 목록: `firebase hosting:channel:list --site <SITE_ID> --project kp-app-k00001`<br>삭제: `firebase hosting:channel:delete <CHANNEL_ID> --site <SITE_ID> --project kp-app-k00001`<br>channel 목록·삭제 명령은 Hosting target 대신 site ID를 받습니다. | [Firebase CLI](https://firebase.google.com/docs/cli), [Preview Channel 관리](https://firebase.google.com/docs/hosting/manage-hosting-resources), [다중 site](https://firebase.google.com/docs/hosting/multisites) |
| 기타 | Preview 기록·프로젝트 인터페이스·HTTP·브라우저 | `.agents/references/kp-app-preview-interface.md`에서 callback 소유 관계를 확인합니다. 화면 검증은 요청 범위의 HTTP 또는 프로젝트 브라우저 절차로 수행합니다. | — |

## 공식 자료

- [Firebase Hosting Preview Channel과 만료·삭제](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- [Firebase Hosting 다중 site와 배포 target](https://firebase.google.com/docs/hosting/multisites)
