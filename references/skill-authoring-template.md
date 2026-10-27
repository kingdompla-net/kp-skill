# Skill 작성 템플릿

이 문서는 `kp-skill` 저장소에서 새 Skill을 만들거나 기존 Skill의 구조를 크게 바꿀 때 적용합니다. 우선 저장소 루트의 [AGENTS.md](../AGENTS.md) 지침을 읽고, 지정한 플러그인의 실제 manifest·README·기존 Skill을 확인합니다. 플러그인별 요구가 이 공통 틀과 다르면 기존 플러그인의 검증된 규칙을 우선 적용합니다.

## 필수 파일과 정본

Skill은 플러그인 안의 `skills/<skill-name>/SKILL.md`가 정본입니다. 폴더명과 frontmatter의 `name`은 일치해야 합니다. 새 Skill은 `metadata.version`을 `1.0.0`으로 시작하며 플러그인 버전과 독립적으로 올립니다.

```text
<plugin>/skills/<skill-name>/
├── SKILL.md
└── agents/
    └── openai.yaml    # Codex UI 메타데이터가 필요할 때만 추가합니다.
```

`SKILL.md`의 기본 틀은 다음과 같습니다.

```markdown
---
name: kp-<domain>-<action>
description: "<사용자의 어떤 요청에서 이 Skill을 선택해야 하는지 한 문장으로 설명합니다.>"
metadata:
  version: "1.0.0"
---

# <기능과 결과를 나타내는 한국어 제목>

<요청을 마쳤을 때 만들어질 결과와 책임 경계를 설명합니다.>

모든 작업은 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽고 따릅니다. 로컬 reference가 아직 없으면 manager 정본을 읽고 프로젝트 로컬 reference를 준비합니다.

## 시작 확인

1. 적용되는 저장소 지침, 현재 작업 상태와 요청 범위를 확인합니다.
2. 공식 문서와 실제 코드에서 필요한 입력·절차·권한을 확인합니다.

## 수행 절차

1. <작업에 필요한 동작을 적습니다.>
2. <실패하거나 필수 정보가 없을 때의 정지 조건을 적습니다.>
3. <필요한 다른 Skill이 있으면 관계 문서를 통해 안내합니다.>

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | `<서비스·endpoint 또는 operation>` | 직접 호출하는지 계약만 확인하는지 적습니다. API를 사용하지 않으면 `없음`으로 표시합니다. | API별 공식 문서를 연결합니다. 내부 KP API는 문서 홈이 아닌 해당 endpoint 문서로 연결합니다. |
| CLI | `<실행 파일>` | 정확한 subcommand와 옵션을 씁니다. 대상에 따라 달라지는 값은 `<...>`로 표시하고 설정 파일 등 확인 위치를 적습니다. 프로젝트 script는 `npm run <SCRIPT_NAME>`처럼 호출 형식과 script 확인 위치를 씁니다. | CLI 또는 명령 reference를 연결합니다. |
| 기타 | `<SDK·emulator·테스트 도구·브라우저 등>` | 작업에 필요한 도구와 대상 저장소에서 확인할 기준을 적습니다. | 문서가 있으면 연결합니다. |

API와 CLI 항목이 여러 개이면 표의 행을 나눠 읽기 쉽게 정리합니다. “Firebase CLI를 사용합니다”처럼 실제 명령을 생략하지 않습니다.

## 검증과 보고

- <필수 검증과 관찰 가능한 성공 기준을 적습니다.>
- <변경, 검증, 외부 상태와 미확인 범위를 구분해 보고합니다.>
```

## 작성 원칙

- 설명 문장은 한국어 존댓말로 작성합니다. 코드 식별자, 명령, 경로, URL, API 필드명과 표준 고정 표기는 필요한 경우 원문을 사용합니다.
- 모든 KP Skill의 `SKILL.md`에는 프로젝트 루트 `AGENTS.md`와 연결된 `.agents/references/credential-and-local-config.md`를 읽으라는 짧은 안내를 넣습니다. 생성·설치 과정에서 해당 프로젝트 로컬 reference가 없으면 manager 정본을 복사하고 `AGENTS.md`에서 연결합니다. 자세한 절차는 공통 기준에 두고 각 Skill에서 반복하지 않습니다.
- `description`은 실제 사용자 목표와 적용 조건을 간결하게 담습니다. 관련 없는 요청까지 끌어들이는 포괄적인 문구는 피합니다.
- 본문에는 이 작업에 필요한 판단 기준과 경계만 둡니다. 상세한 조건별 절차나 기준표가 꼭 필요한 경우에만 `references/`로 분리하고, 본문에서 어떤 경우에 읽을지 연결합니다.
- 결과물에 복사되는 템플릿·이미지는 `assets/`에 둡니다. 반복되는 계산이나 안정성이 필요한 자동화는 `scripts/`에 두고 실제 실행으로 검증합니다.
- 외부 환경 변경, 배포, 권한, OAuth callback이 포함되면 대상 환경과 범위, 사용자 승인 시점, 되돌리기 절차와 확인 증거를 명시합니다.
- 기존 단일 사례를 전체 제품군의 규칙으로 넓히지 않습니다. 실제 저장소와 공식 문서로 확인한 공통점과 예외를 구분합니다.
- 다른 Skill이 필요한 시점에는 관계표를 확인합니다. `kp-skill-manager`나 `kp-credential`의 Skill이 필요하지만 현재 프로젝트·에이전트 범위에 없으면 해당 plugin의 전체 Skill을 자동 설치합니다. 설치 전에는 필요한 작업, 추가할 Skill 이름과 프로젝트 경로를 알리고, 설치 후 실제 경로를 확인해 완료 사실을 알립니다. 별도 동의를 묻지 않고 전역 설치도 하지 않습니다. 다른 선택 Skill은 이유와 이름, 설치 경로를 알리고 동의를 받은 뒤 설치합니다.

## 보조 메타데이터

`agents/openai.yaml`을 둘 때는 다음 필드만 실제 필요에 맞춰 설정하고, 지원되는 스키마는 저장소에 설치된 `skill-creator` 참조를 확인합니다.

```yaml
interface:
  display_name: "<화면에 표시할 이름>"
  short_description: "<짧은 한국어 설명>"
  default_prompt: "<Skill을 호출할 때 사용할 한국어 프롬프트로, $skill-name을 포함합니다.>"

policy:
  allow_implicit_invocation: true
```

자동 호출은 기본 허용으로 둡니다. 사용자가 명시적으로 요청하지 않았다면 `allow_implicit_invocation: false`로 바꾸지 않습니다. Codex 전용 필드는 Claude Code나 Skills CLI의 동작을 보장한다고 설명하지 않습니다.

## README와 버전 연결

새 Skill을 추가하거나 기존 Skill을 변경하면 해당 플러그인의 영문·한국어 README 표에 Skill 링크, 버전, 사용 시점과 역할을 함께 반영합니다. 플러그인 버전을 변경하는 경우에는 plugin manifest, 플러그인 README 두 언어판, 루트 marketplace와 루트 README 두 언어판을 함께 맞춥니다. README의 구성과 문장 형식은 [플러그인 README 작성 기준](plugin-readme-style.md)을 따릅니다.

새 Skill 작성과 배포 승인, 태그·marketplace 갱신은 [KP Skill 관계표와 생성·버전·네이밍 원칙](../kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md) 및 대상 플러그인의 버전 규칙에 따릅니다. 새 Skill의 초기 버전은 `1.0.0`이며, 사용자의 명시적 릴리스 지시 없이 태그를 만들거나 marketplace를 게시하지 않습니다.

## 완료 전 확인

- frontmatter의 `name`과 디렉터리명이 일치하는지 확인합니다.
- 추가한 참조 파일 링크와 플러그인 README 링크가 실제 파일을 가리키는지 확인합니다.
- 변경한 Skill의 `metadata.version`, 플러그인 버전과 모든 버전 목록이 서로 맞는지 확인합니다.
- 해당 Skill을 `scripts/quick_validate.py`로 검사하고, 추가한 스크립트가 있으면 실제 실행으로 검증합니다.
