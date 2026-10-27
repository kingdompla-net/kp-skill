# KP Skill 저장소 지침

## 문서 작성 언어와 문체

- 새 문서와 수정하는 문서의 한국어 설명은 존댓말로 작성합니다. 문장은 `-습니다`, `-세요`와 같은 합쇼체로 끝냅니다.
- 이 규칙은 `SKILL.md`, README, 참조 문서, 템플릿, 예시, 생성되는 프로젝트의 `AGENTS.md`와 운영 문서에 적용합니다. 기존 파일을 수정할 때도 수정한 한국어 설명은 존댓말로 맞춥니다.
- 코드 식별자, 명령, 경로, URL, API 필드명과 표준 고정 표기는 필요한 경우 원문을 유지합니다.
- 저장소에서 영문 문서를 별도로 유지하거나 다른 언어가 명시된 산출물을 요구하는 경우에는 기존 언어 체계를 따릅니다. 한국어가 포함되면 한국어 문장은 존댓말로 작성합니다.
- 기존 문체를 이유로 새 설명을 반말이나 해라체로 작성하지 않습니다.

## Skill 작성

- 이 작성·수정·버전업·배포 규칙은 `kp-skill-create` Skill을 설치했거나 호출했는지와 관계없이 `kp-skill` 저장소에서 Skill 또는 플러그인 작업을 요청받은 모든 에이전트에 적용합니다. 사용자가 Skill 이름을 직접 지정해 저장소에 만들거나 출시해 달라고 요청해도 먼저 이 루트 `AGENTS.md`와 연결된 작성·README 레퍼런스를 읽고 동일한 절차를 따릅니다. `kp-skill-create`는 이 규칙의 진입점 중 하나일 뿐, 규칙 적용 여부를 결정하지 않습니다.
- Skill은 실제 저장소와 공식 문서에서 검증한 절차와 경계만 안내합니다. QT 같은 단일 사례를 모든 KP API의 보편 패턴으로 일반화하지 않습니다.
- 외부 환경을 바꾸는 배포·권한·OAuth callback 단계는 대상, 환경, 되돌리기 절차와 확인 증거를 함께 적습니다.
- 플러그인 버전, 각 Skill의 `metadata.version`, README, marketplace와 plugin manifest의 버전을 함께 갱신합니다.
- 새 Skill은 아래 템플릿을 기준으로 작성하고, 상세 작성 절차와 보조 파일 선택은 [Skill 작성 템플릿](references/skill-authoring-template.md)을 따릅니다.
- 플러그인 README는 한국어·영어판의 구조와 표를 맞추고 [플러그인 README 작성 기준](references/plugin-readme-style.md)을 따릅니다.

## 로컬 설정과 보안 키

- 모든 KP Skill은 시작 시 프로젝트 루트 `AGENTS.md`와 `AGENTS.md`가 연결하는 `.agents/references/credential-and-local-config.md`를 읽습니다. 공통 정본은 `kp-skill-manager/skills/kp-skill-install/references/credential-and-local-config.md`입니다.
- 비밀이 아닌 값이 필요하면 소스 템플릿을 프로젝트 루트의 `AGENTS.local.md`로 복사한 뒤, 사용자가 준 값을 그 프로젝트 로컬 파일의 알맞은 칸에 설정합니다. 원본 템플릿에는 사용자 값을 넣지 않습니다.
- 실제 비밀번호·API key·token·private key는 대화나 `AGENTS.local.md`, `.env`, shell profile, 명령 인수, log와 보고서에 받거나 출력하지 않습니다. API header credential은 `kp-credential`의 숨김 입력과 승인된 `request`로 사용합니다. 지원되지 않는 secret을 임의 환경변수 주입으로 우회하지 않습니다.

### 기본 Skill 템플릿

```markdown
---
name: kp-<domain>-<action>
description: "<어떤 사용자의 요청에서 어떤 결과를 만들 때 사용하는지 설명합니다.>"
metadata:
  version: "1.0.0"
---

# <기능과 결과를 나타내는 한국어 제목>

<Skill의 목적과 작업 범위를 한국어 존댓말로 설명합니다.>

모든 작업은 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽고 따릅니다. 로컬 reference가 아직 없으면 manager 정본을 읽고 프로젝트 로컬 reference를 준비합니다.

## 수행 절차

1. <저장소 상태와 필요한 입력을 확인합니다.>
2. <검증된 절차에 따라 요청된 변경을 수행합니다.>
3. <외부 환경 변경이나 권한이 필요한 경우 승인 경계를 지킵니다.>

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | `<서비스·endpoint 또는 operation>` | 직접 호출하는지 계약만 확인하는지 적습니다. API를 사용하지 않으면 `없음`으로 표시합니다. | API별 공식 문서를 연결합니다. 내부 KP API는 문서 홈이 아닌 해당 endpoint 문서로 연결합니다. |
| CLI | `<실행 파일>` | 정확한 subcommand와 옵션을 씁니다. 대상에 따라 달라지는 값은 `<...>`로 표시하고 설정 파일 등 확인 위치를 적습니다. 프로젝트 script는 `npm run <SCRIPT_NAME>`처럼 호출 형식과 script 확인 위치를 씁니다. | CLI 또는 명령 reference를 연결합니다. |
| 기타 | `<SDK·emulator·테스트 도구·브라우저 등>` | 작업에 필요한 도구와 대상 저장소에서 확인할 기준을 적습니다. | 문서가 있으면 연결합니다. |

API와 CLI 항목이 여러 개이면 표의 행을 나눠 읽기 쉽게 정리합니다. “Firebase CLI를 사용합니다”처럼 실제 명령을 생략하지 않습니다.

## 검증과 보고

- <실행할 검사와 성공 기준을 적습니다.>
- <완료 결과와 확인하지 못한 범위를 구분해 보고합니다.>
```

`agents/openai.yaml`은 실제로 필요한 경우에만 추가하고, 표시 이름·짧은 설명·기본 프롬프트와 호출 정책을 Skill 본문과 일치시킵니다. `references/`, `assets/`, `scripts/`는 재사용할 근거 자료, 생성 결과에 포함할 파일, 반복 실행할 결정적 작업이 있을 때만 추가합니다. 새 Skill은 `1.0.0`에서 시작하고 플러그인 버전은 별도로 관리합니다.

## KP Skill 연결과 필수 관리자 플러그인

- 프로젝트에 `kp-skill`의 Skill을 하나라도 설치할 때는 동일한 프로젝트와 에이전트 범위에 `kp-skill-manager` 플러그인의 Skill 전체도 설치합니다. Codex는 `.agents/skills/`, Claude Code는 `.claude/skills/`를 사용하며, 전역 설치는 하지 않습니다.
- `kp-app-skill` 또는 `kp-api-skill`에서 Skill 하나를 설치할 때는 같은 범위에 `kp-credential` 플러그인의 Skill 전체도 필수로 설치합니다. 해당 앱/API Skill 설치 요청은 manager·credential 의존성 전체를 같은 요청의 설치 묶음으로 포함합니다.
- 설치 안내와 초기화 절차에서는 `kp-skill-manager` 전체, `kp-credential` 전체, 요청된 앱/API Skill 순서로 설치하고 결과를 확인합니다. Claude native plugin의 앱/API manifest에는 두 플러그인 의존성을 선언합니다. Skills CLI 복사 설치는 plugin 의존성을 자동 처리하지 않으므로 manager Skill과 README의 설치 절차에서 같은 순서를 처리합니다.
- 작업에 `kp-skill-manager` 또는 `kp-credential` 플러그인의 Skill이 필요하지만 현재 프로젝트·에이전트 경로에 없으면 해당 플러그인의 전체 Skill 세트를 자동 설치합니다. `kp-credential`을 설치할 때는 manager 전체도 확인·설치합니다. 설치 전에 필요한 작업, Skill 이름과 경로를 사용자에게 알리고 설치 후 추가한 Skill과 경로를 확인해 보고합니다. 별도 설치 동의를 묻지 않고, 사용자 전역 경로는 사용하지 않습니다.
- 앱/API Skill 하나를 설치하거나 사용하는 경우에는 `kp-skill-manager` 전체와 `kp-credential` 전체가 모두 필수입니다. Claude native plugin은 manifest dependency를 따릅니다. Skills CLI 복사 설치는 dependency를 자동 처리하지 않으므로 현재 agent의 프로젝트 경로에서 빠진 Skill만 manager → credential → 요청된 앱/API Skill 순서로 자동 설치하고 검증합니다. 기존 파일과 사용자 수정은 보존합니다.
- 다른 선택 KP Skill이 필요해지는 경우 [KP Skill 관계표와 생성·버전·네이밍 원칙](kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md)을 읽습니다. manager·credential 의존성 이외의 Skill은 필요한 이유와 이름을 설명하고 동의를 받은 뒤 프로젝트 로컬로 설치합니다.
- 관련 Skill은 현재 작업이 해당 책임에 들어올 때만 실행합니다. 관계표에 있다는 이유만으로 모든 Skill을 한꺼번에 실행하거나 설치하지 않습니다.
- `kp-skill-manager`의 생성·릴리스·설치 Skill은 새 Skill 작성, 버전 변경, 설치·갱신 작업 전에 위 관계표와 원칙 문서를 확인합니다.
