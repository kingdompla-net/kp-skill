---
name: kp-app-preview-release
description: "요청된 KP React 앱 변경을 Firebase Hosting Preview Channel에 배포하고, 필요한 OAuth callback을 승인된 앱 설정에 등록·검증할 때 사용합니다."
metadata:
  version: "1.0.2"
---

# KP 앱 Firebase Hosting 프리뷰 배포

작업 시작 시 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽습니다. 로컬 reference가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 사용해 프로젝트 로컬 사본과 `AGENTS.md` 라우트를 준비합니다.

요청된 앱 변경을 임시 Firebase Hosting Preview Channel에 배포해 검토할 때 사용합니다. 이 Skill은 live Hosting channel 배포를 수행하지 않습니다.

## 적용 범위와 시작 확인

1. 사용자가 Preview 배포를 명시적으로 요청했는지 확인합니다. 환경이 지정되지 않으면 DEV를 사용하고, PRD는 사용자가 명시적으로 요청한 경우에만 선택합니다.
2. 대상 저장소 루트, 적용되는 `AGENTS.md`, `AGENTS.local.md`, 현재 브랜치와 `git status --short --branch`를 확인합니다. 브랜치·계정·검토 규칙을 따르고 관련 없는 미커밋 변경이 빌드에 포함될 수 있으면 범위를 확인하기 전 배포하지 않습니다. 기존 변경을 stash, reset, 삭제해 정리하지 않습니다.
3. Preview 또는 `appSetApp` 작업 전에 `.agents/references/kp-app-preview-interface.md`의 환경별 인터페이스를 읽습니다. 파일이 없으면 외부 Preview·앱 설정 변경을 시작하지 말고 해당 파일 또는 인터페이스 설명과 필요한 변수명·저장 위치를 사용자에게 요청합니다. 받은 값을 저장할 때는 지정된 Git 무시 경로만 사용하고, 보고에는 파일 경로와 변수명만 알립니다. `AGENTS.local.md`는 필요한 계정·환경 참조만 확인하고 비밀값을 출력하거나 문서에 복사하지 않습니다. DEV 작업에 PRD 값을 요청하지 않습니다. PRD를 명시적으로 요청받은 경우에만 누락된 PRD 변수의 이름과 저장 위치를 요청합니다.
4. 대상 환경의 `package.json`, `firebase.json`, `.firebaserc`를 대조해 Firebase 프로젝트 ID, Hosting site, Hosting target, 빌드 명령과 callback을 확인합니다. 앱 ID, site ID, 프로젝트, callback 경로를 다른 저장소나 환경에서 복사하거나 추측하지 않습니다. 실제 설정이 모호하면 배포하지 않습니다.
5. Firebase CLI의 로그인 계정과 대상 프로젝트 접근 권한을 확인합니다. 계정·프로젝트·site가 요청한 환경과 일치하지 않으면 먼저 범위를 바로잡고, 현재 사용자의 권한으로 바꿀 수 없는 설정은 필요한 확인을 요청합니다.

## Preview 배포

Preview URL은 링크를 아는 사람이 접근할 수 있는 공개 URL이며, 해당 Firebase 프로젝트의 backend 자원을 사용할 수 있습니다. 대상 환경의 build 설정, API base URL, 앱 ID와 프로젝트 접근 범위를 확인하고, Preview에서 결제·발송 등 실제 부작용이 있는 동작을 실행하지 않습니다.

1. Preview용 channel ID가 요청에 포함되지 않았다면 PR 번호를 우선 사용하고, 없으면 현재 브랜치에서 공백 없는 소문자 kebab-case ID를 정합니다. 대상 Hosting site의 channel 목록을 확인해 같은 ID의 기존 channel이 이 작업의 것인지 확인합니다. 출처를 확인할 수 없는 기존 channel은 덮어쓰지 않습니다.
2. 선택한 환경의 프로젝트 build와 관련 검사를 실행합니다. 앱에 검증된 Preview 전용 스크립트가 있으면 실제 명령과 project·target 범위를 확인한 뒤 사용합니다. 그렇지 않으면 프로젝트 지침에 지정된 DEV 또는 명시된 PRD build를 실행합니다.
3. Firebase 기본 만료 기간에 의존하지 말고, 이 Skill에서 생성하거나 갱신하는 모든 Preview channel의 만료 기간을 1일로 제한합니다. 배포할 때마다 `--expires 1d`를 반드시 지정합니다. 검토가 하루를 넘기면 사용자가 요청한 경우에만 같은 1일 만료값으로 다시 배포합니다.
4. `firebase hosting:channel:deploy`로 요청한 Hosting target에만 배포합니다. 다중 Hosting site에서 `--only`에는 target 이름을 지정하고, 항상 대상 project를 `--project`로 명시합니다. `firebase deploy`나 live channel을 사용하지 않습니다.

~~~sh
firebase hosting:channel:deploy <CHANNEL_ID> --only <HOSTING_TARGET> --expires 1d --project <FIREBASE_PROJECT_ID>
~~~

5. CLI가 출력한 Preview URL을 그대로 사용합니다. URL을 직접 조합하지 않습니다. Hosting channel 목록에서 ID·site·환경·만료일을 readback하고, 해당 URL의 HTTP 응답과 프로젝트가 요구하는 브라우저 화면을 확인합니다.

## OAuth callback 등록

Preview 로그인에 callback 등록이 필요할 때만 진행합니다. Preview 배포 요청만으로 KP 앱 설정의 callback 변경까지 승인된 것으로 보지 않습니다.

1. 앱 source와 프로젝트 인터페이스에서 실제 callback route를 확인하고, CLI가 출력한 Preview URL에 해당 경로를 붙인 정확한 callback URL을 만듭니다. 실제 앱 ID와 환경도 설정에서 확인합니다.
2. 현재 callback 설정을 readback합니다. 사용자에게 환경, 앱 ID, 추가할 callback URL과 변경할 설정을 보여주고 명시적으로 승인받기 전에는 `appSetApp` 또는 그에 해당하는 외부 설정 변경을 실행하지 않습니다.
3. 승인 후 `.agents/references/kp-app-preview-interface.md`에 정의된 절차만 사용해 해당 callback 하나를 추가합니다. 기존 callback과 다른 앱 설정은 보존하고, 새 callback이 readback에서 확인된 경우에만 등록 완료로 기록합니다. API나 필드가 문서화되지 않았거나 readback이 다르면 추측해 변경하지 않습니다.
4. callback이 Preview 배포 전에 이미 존재했으면 이번 작업에서 추가한 것으로 표시하지 않습니다. 이후 정리에서 기존 callback을 제거하지 않습니다.

## 정리 인계와 보고

- PR을 생성하더라도 검토용 Preview와 이번 작업의 callback을 유지합니다. PR 병합을 확인하면 별도 검수 완료 요청을 기다리지 말고 `kp-app-preview-delete`를 사용해 정리합니다. 병합 전에 사용자가 검토 완료나 정리를 요청한 경우에도 같은 Skill을 사용합니다.
- 다음 정리를 위해 프로젝트에서 정한 무시 처리된 로컬 설정 위치에 channel ID, 환경, Firebase project·site·target, branch·commit·PR, Preview URL·만료일, callback URL과 callback이 이번 작업에서 추가됐는지를 기록합니다. 저장 위치가 없으면 `.gitignore`에서 무시되는 `AGENTS.local.md`에 비밀값 없이 기록합니다. 실제 토큰·API key는 기록하지 않습니다.
- Preview URL, 환경, project·site·target, channel ID와 만료일, branch·commit, build·검사·HTTP·브라우저 결과, callback 변경 승인·readback, 후속 정리 기준을 구분해 보고합니다. Preview 배포를 live 배포로 표현하지 않습니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | Firebase Hosting Preview Channel | Hosting REST API를 직접 호출하지 않고 CLI로 관리합니다. | [Preview Channel 관리](https://firebase.google.com/docs/hosting/manage-hosting-resources) |
| API | `appGetApp`·`appSetApp`·Firebase Auth | callback을 readback하고, 등록은 명시적 승인 뒤에 수행합니다. authorized domain 설정은 별도로 확인합니다. | [`appGetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appGetApp-/v2/app/), [`appSetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appSetApp-/v2/app/edit), [Firebase Auth domain](https://firebase.google.com/docs/auth/web/redirect-best-practices) |
| CLI | Git·package manager | `git status --short --branch`로 확인하고 build·검증은 `<PACKAGE_MANAGER> run <SCRIPT_NAME>`으로 실행합니다. | [git status](https://git-scm.com/docs/git-status), [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | 목록: `firebase hosting:channel:list --site <SITE_ID> --project <FIREBASE_PROJECT_ID>`<br>배포: `firebase hosting:channel:deploy <CHANNEL_ID> --only <HOSTING_TARGET> --expires 1d --project <FIREBASE_PROJECT_ID>` | [CLI reference](https://firebase.google.com/docs/cli), [Preview Channel 관리](https://firebase.google.com/docs/hosting/manage-hosting-resources), [다중 site](https://firebase.google.com/docs/hosting/multisites) |
| 기타 | 프로젝트 인터페이스·HTTP·브라우저 | `.agents/references/kp-app-preview-interface.md`와 프로젝트의 브라우저 규칙을 따릅니다. Preview URL은 CLI 출력에서 가져옵니다. | — |

## 공식 자료

- [Firebase Hosting Preview Channel과 만료·삭제](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- [Firebase Hosting 다중 site와 배포 target](https://firebase.google.com/docs/hosting/multisites)
