# KP Skill 로컬 설정과 보안 키 처리

이 문서는 모든 KP Skill이 사용하는 공통 로컬 설정·자격 증명 기준입니다. `kp-skill-manager`에 있는 이 정본을 설치된 프로젝트의 `.agents/references/credential-and-local-config.md`에 복사하고, 프로젝트 루트 `AGENTS.md`에서 해당 파일을 라우팅합니다. Skill 실행 시에는 프로젝트 로컬 문서를 먼저 읽고, 그 파일이 아직 없으면 manager 정본을 읽습니다.

## 프로젝트 로컬 reference 준비

프로젝트에 `.agents/references/credential-and-local-config.md`가 없으면 설치된 `kp-skill-manager`의 `kp-skill-install/references/credential-and-local-config.md`를 복사합니다. 원본이나 이미 존재하는 프로젝트 파일은 덮어쓰지 않습니다. 프로젝트 루트 `AGENTS.md`에 다음 라우팅 규칙을 추가하고, `AGENTS.md`가 없으면 이 규칙만 담은 파일을 만듭니다.

```markdown
- 모든 KP Skill은 `.agents/references/credential-and-local-config.md`를 읽고 로컬 설정·비밀정보 기준을 따릅니다.
```

## 필요한 manager·credential Skill 자동 설치

작업에 `kp-skill-manager` 또는 `kp-credential` 플러그인의 Skill이 필요하지만 현재 프로젝트·에이전트 범위에 없으면, 해당 플러그인의 전체 Skill 세트를 자동으로 설치한 뒤 작업을 이어갑니다. manager가 필요하면 manager 전체를 설치하고, credential이 필요하면 manager 전체를 먼저 확인·설치한 다음 credential 전체를 설치합니다. `kp-app-skill`이나 `kp-api-skill`의 Skill을 사용하거나 설치할 때는 두 플러그인 전체가 모두 필수입니다. 관계표에 있다는 이유만으로 필요하지 않은 credential이나 다른 KP Skill까지 설치하지 않습니다.

사용자에게 별도 설치 동의를 다시 묻지 않습니다. 설치 직전에 필요한 작업, 추가할 플러그인과 Skill, 설치 대상 경로를 알립니다. 예: “API endpoint를 검증하려면 `kp-skill-manager`의 `kp-skill-install` Skill과 `kp-credential`의 `kp-credential` Skill이 필요합니다. 현재 Codex 프로젝트 경로에 없어 각 플러그인의 전체 Skill을 설치하고, 바로 사용할 수 있도록 `kp-credential` CLI도 이 컴퓨터의 사용자 환경에 준비한 뒤 진행하겠습니다.” 설치 후 실제 경로, CLI 버전과 명령 탐색 결과를 확인해 추가한 Skill 이름과 경로를 알려 작업을 계속합니다. 설치가 실패하면 필요한 조치와 실패 원인을 안내하고, 설치된 것처럼 가정해 의존 작업을 수행하지 않습니다.

Skills CLI 복사 설치에서는 현재 실행 중인 Skill의 agent와 프로젝트 범위를 확인한 뒤 대상 저장소 루트에서 누락된 Skill만 설치합니다. manager Skill은 다음 정본에서 가져옵니다.

```sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills --skill <MISSING_MANAGER_SKILL_NAMES> --agent <CURRENT_AGENT> --copy --yes
```

credential Skill은 다음 정본에서 가져옵니다.

```sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills --skill <MISSING_CREDENTIAL_SKILL_NAMES> --agent <CURRENT_AGENT> --copy --yes
```

`<MISSING_MANAGER_SKILL_NAMES>`와 `<MISSING_CREDENTIAL_SKILL_NAMES>`에는 설치 경로에서 확인한 누락 Skill 이름만 넣습니다. `--agent`는 현재 실행 중인 에이전트 식별자로 바꾸며, 다른 agent를 함께 지정할 필요가 없으면 하나만 씁니다. 사용자 전역 설치를 명시하지 않았다면 `--global`/`-g`를 사용하지 않습니다. Claude native plugin은 manifest 의존성으로 설치하고 같은 Skill을 복사 방식으로 중복 설치하지 않습니다.

`kp-app-skill`과 `kp-api-skill`은 manager 전체와 credential 전체를 의존성으로 선언합니다. `kp-credential`은 manager 전체를 의존성으로 선언하며, manager 단독 설치에는 credential이 필요하지 않습니다.

### `kp-credential` CLI를 설치 시 준비

`kp-credential` Skill을 앱/API Skill의 dependency로 설치하는 동안 CLI도 같은 작업에서 설치·갱신합니다. CLI는 macOS Keychain 또는 Windows Credential Manager를 호출하는 npm package이므로 project Skill 폴더가 아니라 현재 OS 사용자의 전역 npm 환경에 설치합니다. API credential을 처음 사용할 때까지 설치를 미루지 않습니다.

1. 방금 설치했거나 이미 설치된 `kp-credential` Skill 폴더의 `scripts/install-global.mjs`를 agent가 실행합니다. helper가 OS를 판별하고 Node.js 20 이상, npm, 사용자 npm 전역 경로와 CLI 버전을 확인합니다.
2. helper는 Skill 폴더 안의 `package.json`을 기준으로 package tarball을 만들고 npm 사용자 전역 환경에 설치·갱신합니다. 프로젝트 Skill 폴더 자체를 전역 링크로 연결하지 않습니다.
3. helper는 macOS zsh/bash 설정 파일 또는 Windows 사용자 PATH를 필요한 경우에만 중복 없이 보완하고, CLI 버전과 일반 명령 탐색을 검증합니다. 설정이 바뀌어 현재 터미널에서 PATH가 갱신되지 않으면 새 터미널을 열도록 안내합니다. 사용자에게 경로나 환경변수 값을 직접 입력하게 하지 않습니다.
4. Node.js/npm이 없거나 설치 권한 문제가 있으면 `sudo npm` 등으로 우회하지 말고 원인과 필요한 준비를 설명합니다. 준비가 끝나면 같은 agent 설치 작업에서 helper 실행을 재시도합니다.

`npx skills add`를 사용자가 agent 없이 직접 실행하면 Skills CLI는 Skill 파일만 복사하며 OS package 설치를 실행하지 않습니다. 따라서 agent가 KP Skill을 설치할 때에는 위 OS CLI 설정까지 설치 단계의 일부로 마치고, 수동 복사만 된 경우에도 credential 작업을 시작하기 전에 먼저 CLI 설정을 완료합니다.

## 프로젝트 로컬 설정값 작성

필요한 비밀이 아닌 값이 설정이나 저장소에서 확인되지 않을 때만 사용자에게 값, 환경, 사용 목적을 요청합니다. 프로젝트에 `AGENTS.local.md`가 없으면 관련 plugin의 `assets/templates/AGENTS.local.md` 또는 manager의 `assets/templates/AGENTS.local.md`를 프로젝트 루트로 복사합니다. 값을 입력하는 위치는 복사본의 해당 환경·설정 항목입니다. plugin의 source template에는 사용자 값을 입력하지 않습니다. 기존 `AGENTS.local.md`가 있으면 그 파일을 유지하며, 부족한 항목만 적절한 위치에 추가합니다.

## 필요한 입력 찾기

1. 사용자의 요청, 저장소 지침, `AGENTS.local.md`, 실제 설정 파일, 공식 문서와 현재 CLI 로그인 상태를 확인합니다. 이미 확인되는 값은 다시 묻지 않습니다.
2. 이번 작업에 필요한 항목만 식별합니다. 각 항목의 이름, 환경, 사용 목적, 비밀 여부와 필요한 저장 위치를 확인합니다. Skill이 사용하지 않는 모든 환경값을 미리 수집하지 않습니다.
3. 필요한 비밀 아닌 값이 확인되지 않으면 사용자에게 변수명 또는 항목명, 환경, 사용 목적을 설명하고 대화로 값을 요청합니다. 값은 프로젝트 루트 `AGENTS.local.md` 복사본의 해당 위치에 설정합니다. 적절한 칸이 없으면 프로젝트 로컬 파일에 `추가 비밀 아닌 설정` 항목을 만듭니다.
4. `AGENTS.local.md`에 쓰기 전에 `git ls-files -- AGENTS.local.md` 결과가 비어 있는지 확인합니다. 이미 Git이 추적 중이면 무시 규칙만 추가해도 공개 저장소에서 빠지지 않으므로 값을 쓰지 말고 추적 해제부터 안내합니다.
5. 저장소 루트에서 `git check-ignore -v AGENTS.local.md`로 Git 무시 여부를 확인합니다. 무시되지 않으면 저장소 `.gitignore`에 해당 로컬 파일을 추가하고 다시 확인합니다. 기존 파일과 사용자가 적은 값은 덮어쓰지 않습니다.
6. 값이 실제 실행 설정에도 필요하면 대상 프로젝트가 정한 로컬 설정 파일에 반영합니다. 먼저 해당 파일이 Git에서 무시되는지 확인하고, 공개 브라우저 bundle에 포함되는 설정인지 검증합니다. 비밀값을 넣어야만 동작하는 방식이면 중단하고 아래 비밀정보 절차를 따릅니다.

비밀이 아닌 입력을 요청할 때는 값을 받을 수 있는 메시지를 보냅니다. 예: “DEV Firebase project ID `VITE_FIREBASE_PROJECT_ID`가 설정에서 확인되지 않습니다. 이 값은 공개 식별자이며 앱 초기화에 사용합니다. 값을 알려주시면 `AGENTS.local.md`의 DEV 설정에 기록하겠습니다.” 사용자가 이미 제공한 값이나 저장소에서 확인한 값을 반복 요청하지 않습니다.

## 비밀정보 저장 위치 선택

| 필요한 비밀정보 | 저장·인증 경로 |
| --- | --- |
| 에이전트가 호출할 HTTPS API의 API key·token header | `kp-credential`의 숨김 입력과 사용자 승인 범위. 승인된 `origin`, path, method, header만 요청 broker가 사용합니다. |
| Firebase·Google Cloud 또는 GitHub CLI 로그인 | 해당 CLI를 로컬에서 사용할 계정으로 공식 대화형 로그인 flow를 사용합니다. 예: `firebase login`, `gcloud auth login`, `gcloud auth application-default login`, `gh auth login`. 이 명령은 CLI 로그인용이며 API key나 Functions runtime secret을 저장하는 절차가 아닙니다. 비밀번호나 OAuth token을 채팅·`AGENTS.local.md`에 받지 않습니다. |
| 서버 runtime secret | 이 공통 로컬 설정 흐름에 포함하지 않습니다. 배포 작업에서 필요한 경우 해당 API 배포 Skill의 별도 Secret Manager 지침을 따릅니다. 이 로컬 credential 도구로 cloud secret을 읽거나 설정하지 않습니다. |
| 브라우저에서 실행되는 앱의 설정 | 공개되어도 되는 식별자·URL만 설정합니다. 비밀 API key·private token은 browser bundle이나 `VITE_` 변수에 넣지 않고, 사용자 인증 또는 서버 API를 사용합니다. |
| 임의 CLI의 비밀 환경 변수, 브라우저 로그인 form, 지원 adapter가 없는 secret | 이 버전의 `kp-credential`은 지원하지 않습니다. 비밀값을 요청하거나 `export`, shell profile, `.env`로 우회하지 말고 필요한 공식 인증·Secret Manager·제한형 adapter를 안내합니다. |

`AGENTS.local.md`에는 환경 변수 이름과 비밀이 아닌 값만 기록합니다. 비밀번호, API key, access/refresh token, private key, 인증서, service account JSON 및 이와 같은 권한 비밀을 대화나 로컬 문서에 입력하지 않습니다. Secret Manager 또는 `kp-credential` 항목 이름은 기록할 수 있지만 실제 값은 기록하지 않습니다.

프로젝트에 `AGENTS.local.md`가 없으면 manager 설치본의 `assets/templates/AGENTS.local.md`를 프로젝트 루트에 복사하고, Git 무시 여부를 확인한 뒤 요청된 값을 필요한 위치에 설정합니다. 앱·API 초기화 Skill은 해당 plugin의 상세 템플릿을 사용하며, 기존 파일이 있으면 기존 내용을 유지하고 필요한 섹션만 병합합니다. 원본 `assets/templates/AGENTS.local.md`에는 사용자 값을 넣지 않습니다.

## `kp-credential`이 필요한 경우

앱/API Skill 설치 때 CLI가 OS 사용자 환경에 준비됐는지 확인합니다. 수동 Skills CLI 복사 설치 등으로 준비되지 않았거나 버전이 다르면 credential 작업보다 먼저 설치된 `kp-credential` Skill의 `scripts/install-global.mjs`를 agent가 실행합니다. helper가 Skill package를 사용자 npm 전역 환경에 설치하고, 필요한 경우 OS 사용자 PATH를 보완한 뒤 버전과 일반 명령 탐색을 확인합니다. Node.js 20 이상, npm, registry 접근과 사용자 쓰기 가능한 npm 전역 prefix가 필요합니다. 필수 조건이 없으면 원인과 조치를 안내하고, 준비되면 자동으로 다시 시도합니다. 권한 오류를 우회하려고 `sudo npm`을 실행하거나 CLI가 준비된 것처럼 작업을 계속하지 않습니다. 자세한 내용은 [CLI 안내](https://github.com/kingdompla-net/kp-skill/blob/main/kp-credential/skills/kp-credential/CLI.md)를 확인합니다.

필요한 항목이 없을 때는 값을 요구하지 말고 사용자에게 다음 사항을 알려줍니다.

- 필요한 서비스와 DEV·PRD 환경
- 비밀 항목의 목적과 `kp-credential`에 저장할 정확한 항목 라벨
- 사용할 HTTPS origin, path prefix, header와 method
- 값을 채팅에 보내지 말고, 터미널의 숨김 입력으로 직접 저장한다는 점
- `add`와 범위를 알고 있는 경우 `grant`의 실제 명령
- 저장 후에는 항목 라벨과 저장·승인 완료 여부만 회신하면 에이전트가 `request`를 사용할 수 있다는 점

예를 들어 API 계약에서 `X-API-Key` header가 확인됐다면 아래처럼 안내합니다. `<...>`는 저장소와 API 계약에서 확인한 실제 항목으로 채우고, 비밀값으로 바꾸지 않습니다.

항목 라벨은 저장소 폴더나 파일 경로가 아니라 macOS Keychain 또는 Windows Credential Manager 안에 보이는 credential 이름입니다.

```sh
kp-credential add kp-skill/<저장소>/<환경>/<용도>
kp-credential grant kp-skill/<저장소>/<환경>/<용도> --origin https://api.example.com --path-prefix /v1/resource --header X-API-Key --methods GET
```

`grant`는 실제 API 계약과 작업에 필요한 최소 범위로 채웁니다. `Authorization: Bearer` 방식이면 `--header Authorization --prefix 'Bearer '`를 사용합니다. `--prefix`에는 고정된 scheme만 넣고 비밀값은 넣지 않습니다. 계약에서 origin, 경로, method 또는 header를 확인할 수 없다면 추측하지 말고 비밀이 아닌 API 정보를 확인합니다.

사용자에게 “명령을 로컬 터미널에서 실행하고 숨김 입력에 값을 넣어 주세요. 값은 채팅에 붙이지 마세요. 완료되면 `<항목 라벨>`이 저장되고 승인됐다고만 알려 주세요.”라고 안내합니다. 필요한 값은 끝까지 출력되지 않으며, 에이전트는 사용자의 완료 확인 뒤 승인 범위 안에서만 다음 형식으로 요청합니다.

```sh
kp-credential request kp-skill/<저장소>/<환경>/<용도> --url https://api.example.com/v1/resource
```

에이전트는 `kp-credential`의 저장값 조회 기능이 있다고 가정하거나 값을 직접 출력·복사하지 않습니다. 자격 증명을 그대로 또는 변환해 응답에 포함할 수 있는 endpoint에는 권한을 승인하지 않습니다. 응답 본문을 작업에 쓸 때도 secret 반사 여부를 고려하고, 값이나 민감한 응답은 대화·로그·최종 보고에 남기지 않습니다.

로그인 credential이 필요한 경우에는 먼저 해당 CLI의 활성 계정과 권한을 확인합니다. 로그아웃 상태라면 서비스의 대화형 로그인 명령을 알려 사용자가 자신의 터미널에서 완료하게 합니다. 이메일·계정 식별자와 로그인 완료 여부만 회신받고, 비밀번호나 token은 받지 않습니다. 웹 로그인 form을 에이전트가 자동으로 채워야 하는데 이미 인증된 session이나 안전한 공식 adapter가 없다면 그 단계는 지원되지 않는다고 알립니다.

## Skill 작성·실행 기준

- 모든 KP Skill은 저장소 `AGENTS.md` 및 이 문서에서 라우팅하는 프로젝트 로컬 사본을 읽습니다. 프로젝트 로컬 사본이나 manager reference가 없더라도 의존 Skill 자동 설치를 생략하지 않습니다. 먼저 필요한 manager·credential 전체 세트를 위 명령으로 설치하고 이 문서를 읽은 뒤 작업을 계속합니다. `kp-skill-create`와 Skill 작성 템플릿은 새 Skill에 동일한 자동 설치·사용자 안내 기준과 한 줄 라우팅을 포함합니다.
- Skill은 누락된 비밀정보에 대해 서비스·환경·목적, 안전한 CLI 명령과 값 미전달 지침을 안내합니다. 사용자 회신으로 받을 내용은 항목 라벨과 완료 여부뿐입니다.
- `kp-credential`은 HTTPS API request header 전용입니다. Skill은 이를 임의 프로세스의 환경 변수 공급기, 웹 로그인 도구 또는 범용 secret manager로 설명하지 않습니다.
- 작업 결과와 최종 보고에는 설정 파일 경로, 변수명, credential label, 승인된 scope와 동작 결과만 기록하고 secret 값은 기록하지 않습니다.
