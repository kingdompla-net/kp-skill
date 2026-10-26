---
name: kp-api-docs
description: "배포된 KP API 중 공개할 계약만 kingdom-planet-center API Docs에 반영하고 만료형 Preview로 검토할 때 사용합니다."
metadata:
  version: "1.0.0"
---

# KP API Developer Center 문서 반영

실제 배포가 확인된 API의 공개 계약을 로컬 `kingdom-planet-center` 저장소에 반영하고, 사용자 검토용 1일 Preview를 제공합니다. DEV·PRD live Hosting에 곧바로 배포하지 않습니다. API 코드가 merge됐거나 테스트를 통과했다는 사실만으로 cloud 배포가 완료됐다고 간주하지 않습니다.

## 적용 조건과 작업 경계

1. 배포 환경과 function export가 실제 API 배포 증거로 확인됐는지 점검합니다. 배포 전 source만 있는 경우 문서 반영은 준비할 수 있지만 “배포된 API 문서”로 배포 상태를 표시하지 않습니다.
2. API 저장소의 `AGENTS.md`, 필요 시 `AGENTS.local.md`, 인증·request schema·response·errors·route·배포 대상과 공개 사용 목적을 읽습니다. 기존 contract와 차이가 있으면 API source 또는 담당자에게 확인합니다.
3. 로컬 `kingdom-planet-center` 저장소를 찾고 Git remote가 `kingdompla-net/kingdom-planet-center`인지 확인합니다. Center repo가 없으면 URL을 직접 수정하지 말고 로컬 clone 경로를 요청합니다.
4. Center branch, worktree와 `git status --short --branch`를 확인합니다. dirty하거나 base가 오래되어 있으면 사용자 변경을 보존하고 `origin/dev` 기반 별도 worktree를 사용합니다. Center 기본 PR base는 사용자 지시가 없는 한 `dev`입니다.
5. Center의 repository 지침과 canonical PR template을 따릅니다. 새 문서의 한국어 설명은 존댓말로 작성합니다.

## 문서 대상 환경

| 배포가 확인된 API 환경 | Developer Center 문서 경로 |
| --- | --- |
| DEV | [https://developer-kpcenter-dev.web.app/api/](https://developer-kpcenter-dev.web.app/api/) |
| PRD | [https://developer-kpcenter.web.app/api](https://developer-kpcenter.web.app/api) |

변경할 catalog 파일, 빌드 대상과 최종 Hosting 환경은 현재 `kingdom-planet-center`의 설정과 API 배포 근거를 확인해 결정합니다. 개발 API를 PRD 문서에, PRD API를 DEV 문서에 임의로 섞지 않습니다. Preview는 공개 검토용이므로 기본적으로 DEV Developer Center Preview Channel에서 확인하고, PRD Hosting project의 live channel에는 직접 배포하지 않습니다.

## 공개할 API 선택

- public Developer Center에는 실제 앱 개발자가 사용할 API만 추가합니다. 함수 export가 존재한다는 이유로 worker, schedule, queue control, 운영 callback, 관리자 전용 또는 server-to-server 내부 API를 공개하지 않습니다.
- API route와 function 이름은 Center의 `src/kp-dev/data/api-docs-v2.json` 구조를 기준으로 기존 codebase와 함께 검토합니다. PR #50의 QT 조회 문서, PR #51의 API 상세 렌더러 보완, PR #52의 내부 QT run/status endpoint 제거를 사례로 삼습니다.
- API마다 path, HTTP method, function name, auth label, headers/query/body, 필수 여부, example, success response와 error code를 실제 handler와 공통 middleware에서 대조합니다. API key나 실제 credential은 절대 example에 넣지 않습니다.
- QT의 `/v2/qt/daily/run` 및 `/v2/qt/daily/run/status`는 내부 server-to-server operation으로 공개 catalog에서 제거된 사례입니다. 유사한 operation은 공개 대상 승인과 사용 목적이 확인되기 전에는 catalog에 넣지 않습니다.
- Center 자료와 renderer의 기존 contract를 유지합니다. 새로운 UI component나 예시 형식을 만들기 전에 `api-docs-v2.json`의 기존 row와 `src/kp-dev/page/api/[api].vue` 렌더링 경로를 확인합니다.

## 로컬 구현과 검증

1. Center repo의 dependency manager, 현재 build script, `.env*` 존재 여부(값은 출력하지 않음), Firebase config와 Hosting site/target을 확인합니다.
2. API doc JSON에 공개 API만 추가하거나 수정하고, 필요한 경우 parser·renderer 동작을 테스트합니다. docs 변경과 무관한 generated files 및 refactor는 포함하지 않습니다.
3. Center의 기존 `build`와 문서 JSON·function name 검증 명령을 실행합니다. build 통과는 API cloud deployment나 live Developer Center 배포 증거와 별개로 보고합니다.
4. 로컬 test data의 JSON 문법, API count, unique function names, route path, category, renderer에서 빈 URL 처리, 승인된 endpoint만 노출되는지 확인합니다.

## 1일 Preview와 임시 callback

Preview는 사용자 검토를 위한 임시 외부 배포이며 URL을 아는 누구나 접근할 수 있습니다. Firebase Hosting Preview Channel은 만료 시점을 `--expires 1d`로 지정하고, Center의 DEV Developer site 및 정확한 DEV Firebase project에만 배포합니다. Preview는 실제 project backend resource와 통신할 수 있으므로 build environment와 API base URL, app ID가 DEV용인지 확인합니다. API 문서 원고가 PRD 배포용이어도 리뷰용 Preview는 DEV Hosting과 DEV app 설정으로 한정합니다. 사용자가 임시 callback 변경을 승인한 경우에는 DEV 로그인 흐름을 확인할 수 있지만, PRD 앱 설정·PRD API 호출·결제·발송·삭제 같은 업무 부작용은 실행하지 않습니다.

1. Preview channel을 만들기 전에 로컬 build와 URL/environment 설정을 검증합니다. Firebase CLI가 사용하는 인증 계정, DEV project ID, Hosting target과 channel ID를 사용자에게 표시합니다.
2. `firebase hosting:channel:deploy <채널-ID> --only <실제-DEV-Hosting-target> --expires 1d --project <DEV-Center-project-ID>` 형식으로 선택한 site에만 deploy합니다. 실제 config와 CLI가 지원하는 옵션을 확인하며 PRD alias, 기본 프로젝트 또는 live `firebase deploy`를 사용하지 않습니다.
3. CLI나 Firebase Auth 설정이 preview host를 authorized domain에 자동 추가하는지 확인합니다. Preview에서 auth domain 변경이 필요하면 추가될 정확한 항목과 현재 목록을 먼저 사용자에게 보여드리고 승인받은 뒤 변경합니다. 변경한 항목과 기존 목록을 기록하고, Preview 검증에 필요한 범위를 넘겨 수정하지 않습니다.
4. Preview URL이 나온 뒤 callback을 구성합니다. 현재 Center의 KP OAuth 경로는 `${preview-origin}/auth/callback`을 `redirect_uri`로 전달하며, API는 앱 설정의 `oauth_redirect_uri_list`와 대조합니다. 이것은 Firebase Auth의 `authorizedDomains`와 다른 설정입니다.
5. DEV용 Developer Center app 설정의 `oauth_redirect_uri_list`를 확인합니다. 기존 목록과 추가할 정확한 Preview callback URL을 사용자에게 보여드리고 승인받은 뒤에만 임시로 추가합니다. 공개 API key, DB 직접 조작, PRD 앱 설정 변경을 사용하지 않습니다. 승인된 앱 설정 경로가 없거나 쓰기 권한이 부족하면 실제 차단 항목과 관리자 요청을 안내하고 임의 우회하지 않습니다.
6. 사용자에게 Preview URL과 만료 시각을 제공하고 문서 내용과 로그인 흐름을 검토하도록 합니다. 사용자가 확인하기 전에는 Preview와 임시 callback을 제거하지 않습니다. Preview는 기본적으로 1일 후 만료되지만, TTL은 callback 정리까지 대신하지 않습니다.
7. 검토가 끝나면 먼저 임시 callback URL만 DEV app의 `oauth_redirect_uri_list`에서 제거하고 변경 후 목록을 확인합니다. Preview를 위해 Firebase Auth authorized domain이 추가된 경우 이번 실행에서 추가한 도메인만 정리합니다. 기존에 있던 항목은 삭제하지 않습니다.
8. `firebase hosting:channel:delete <채널-ID> --site <DEV-Center-site-ID> --project <DEV-Center-project-ID>`로 이번 작업의 channel을 삭제합니다. Firebase는 channel과 연결된 release·version의 삭제를 24시간 안에 예약할 수 있으므로 URL이 즉시 비활성화됐다고 추정하지 말고 channel 상태를 다시 확인합니다. 삭제 결과를 확인하고 callback, Auth domain, channel의 정리 결과를 각각 기록합니다.

Firebase Preview Channel은 만료를 지정해도 공개 URL이고 연결된 backend resource를 사용할 수 있습니다. 따라서 DEV 설정만 쓰고, Preview를 불특정 사용자에게 공유하지 않으며, 외부 부작용이 있는 요청으로 로그인 테스트를 하지 않습니다.

## PR과 실제 Developer Center 배포

- 사용자 검토가 승인되고 임시 preview 설정을 정리한 뒤 변경을 맥락별 commit으로 준비합니다. Commit 전에 repository 지침에 따라 승인 받을 범위와 diff, 검증, PR template draft를 보고합니다.
- 공개된 DEV API contract의 PR은 Center `dev` base를 기본으로 합니다. PR 생성과 merge는 해당 작업의 사용자 승인 정책을 따릅니다. PR merge 자체를 DEV Hosting release 증거로 표현하지 않습니다.
- PRD API docs는 PRD API 배포가 확인된 뒤에만 준비합니다. Center PR base와 production delivery 경로가 불명확하면 임의로 `main` 또는 PRD project를 선택하지 않습니다.
- Preview에서 내용 검토가 끝나면 실제 API 배포 환경에 맞는 DEV 또는 PRD 문서 경로를 확인하고, 사용자에게 최종 diff·검증·대상 Hosting site와 project를 보여드립니다. 변경 검토 승인을 받은 경우에만 commit과 PR을 해당 repository 절차에 따라 준비합니다. PR merge와 live Hosting 배포는 각각 해당 작업에 대한 사용자의 명시적 승인을 받은 뒤 진행합니다. DEV API는 DEV 문서, PRD API는 PRD 문서가 대상입니다. Preview 성공이나 PR merge만으로 live release 성공을 보고하지 않습니다.
- 사용자가 Preview 검토만 요청했거나 최종 live release를 승인하지 않은 경우에는 callback과 Preview를 정리한 뒤 로컬 변경·PR 초안까지만 준비합니다. DEV·PRD live Hosting에는 배포하지 않습니다.

## 완료 보고

수정한 Center 경로, 반영한 공개 endpoint, API 배포 환경과 근거, local build/JSON 검증, Preview URL·만료, 임시 callback/authorized-domain 추가와 제거, channel 정리 결과, PR·live release 상태를 분리해 보고합니다. 완료하지 못한 cleanup이나 권한 부족을 성공으로 표시하지 않습니다.

## 참고 자료

- Center 자료와 PR #50–#52에서 확인한 규칙: [Developer Center 문서 레퍼런스](references/center-api-docs.md)
- Firebase preview channel 생성·만료·삭제: [Firebase Hosting preview 설정](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- Preview URL 공개 범위와 실제 backend 연결: [로컬 테스트, 공유 Preview, live 배포](https://firebase.google.com/docs/hosting/test-preview-deploy)
- 특정 Hosting site의 Preview target 지정: [Firebase Hosting 다중 site](https://firebase.google.com/docs/hosting/multisites)
- API codebase/router/source 패턴: [`kp-api-init` 저장소 분석](../kp-api-init/references/api-project-architecture.md)

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | 공개 KP API | 배포 근거가 있는 endpoint별 contract(계약)를 확인합니다. | [DEV Developer Center](https://developer-kpcenter-dev.web.app/api/), [PRD Developer Center](https://developer-kpcenter.web.app/api) |
| API | `appGetApp`·`appSetApp` | Preview callback을 readback하고, `appSetApp`은 명시적 승인 뒤에만 변경합니다. | [`appGetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appGetApp-/v2/app/), [`appSetApp`](https://developer-kpcenter-dev.web.app/api/app#app-appSetApp-/v2/app/edit) |
| API | Firebase Auth `authorizedDomains` | Preview domain을 다룰 때 redirect 및 authorized domain 계약을 확인합니다. | [redirect·authorized domain](https://firebase.google.com/docs/auth/web/redirect-best-practices) |
| CLI | Git·package manager | `git status --short --branch`로 확인하고, Center 저장소에서 확인한 script를 `<PACKAGE_MANAGER> run <SCRIPT_NAME>`으로 실행합니다. | [git status](https://git-scm.com/docs/git-status), [npm run](https://docs.npmjs.com/cli/v11/commands/npm-run-script) |
| CLI | Firebase CLI | Preview 배포: `firebase hosting:channel:deploy <CHANNEL_ID> --only <HOSTING_TARGET> --expires 1d --project <DEV_PROJECT_ID>`<br>삭제: `firebase hosting:channel:delete <CHANNEL_ID> --site <DEV_SITE_ID> --project <DEV_PROJECT_ID>` | [CLI reference](https://firebase.google.com/docs/cli), [Preview Channel 관리](https://firebase.google.com/docs/hosting/manage-hosting-resources), [다중 site](https://firebase.google.com/docs/hosting/multisites) |
| 기타 | `api-docs-v2.json`·renderer·검사 도구·Aside Browser | JSON과 기존 renderer를 확인하고 Developer Center 및 Preview 화면을 프로젝트 브라우저 규칙에 따라 살펴봅니다. | — |

## KP Skill 관계와 관리자 설치

- 이 Skill을 프로젝트에서 사용할 때는 동일한 프로젝트·에이전트 경로에 `kp-skill-manager`의 세 Skill이 있는지 확인합니다. 없으면 manager의 역할과 필요한 설치 경로를 설명하고 설치 동의를 받은 뒤에만 manager 전체를 프로젝트 로컬로 설치합니다. 거부하면 KP Skill 작업을 진행하지 않습니다. 사용자가 manager 설치를 직접 요청한 경우는 설치 동의로 봅니다.
- 다른 KP Skill이 필요해지면 아래 정본 문서 또는 현재 에이전트의 `.agents/skills/kp-skill-install/references/`나 `.claude/skills/kp-skill-install/references/`에 있는 관계표를 읽습니다. 필요한 Skill이 없으면 이유와 이름을 알리고 추가 설치 동의를 구합니다. 동의한 Skill만 설치하며 관계표의 모든 Skill을 무조건 실행하지 않습니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-api-docs/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-api-docs/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 manager 선행 조건은 [플러그인 안내](../../README.ko.md)를 확인합니다.
- 정본 관계표: `kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md`.
