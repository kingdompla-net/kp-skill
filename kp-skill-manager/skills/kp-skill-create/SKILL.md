---
name: kp-skill-create
description: "KP Skill 저장소에서 새 플러그인과 기본 Skill을 함께 만들거나, 지정한 기존 플러그인에 Skill을 추가할 때 사용합니다."
metadata:
  version: "1.0.1"
---

# KP Skill과 플러그인 생성

이 저장소의 구조와 작성 관례를 확인해 재사용할 플러그인 또는 Skill을 추가합니다. 요청에 새 플러그인 생성과 기존 플러그인 내 Skill 추가가 함께 포함되면 두 작업을 같은 변경 맥락으로 연결합니다.

## 시작 확인

1. 저장소 루트, 적용되는 `AGENTS.md`, 현재 branch와 `git status --short --branch`를 확인합니다. 기존 변경과 미추적 파일을 보존합니다.
2. 요청이 플러그인 생성인지, 기존 플러그인에 Skill을 추가하는 일인지 구분합니다. 사용자가 이름과 대상 플러그인을 이미 지정했다면 다시 묻지 않습니다.
3. 지정한 플러그인의 manifest, README, 다른 Skill의 `SKILL.md`, `agents/openai.yaml`, references와 templates를 읽고 실제 작성 규칙을 따릅니다. 다른 플러그인의 규칙을 그대로 덮어쓰지 않습니다.
4. 관련 지침은 [저장소 Skill 작성 규칙](../../../AGENTS.md)과 [버전·릴리스·이전 콘텐츠 재발행 기준](../kp-skill-release/references/versioning-and-rollback.md)을 확인합니다.

## 새 플러그인과 Skill을 함께 만들 때

- 플러그인 이름과 내부 Skill 이름은 서로 다른 책임을 드러내도록 정합니다. 이미 정한 이름이 있으면 그대로 사용합니다.
- 기존 플러그인의 구성을 참고해 플러그인 디렉터리, manifest, 영문·한국어 README와 최소 한 개의 진입 Skill을 구성합니다.
- 루트 `.claude-plugin/marketplace.json`에 플러그인 경로, 설명, 버전을 등록합니다. 루트 README 양쪽 언어 버전에도 플러그인과 모든 Skill의 링크를 추가합니다.
- 새 플러그인과 첫 Skill은 각 manifest와 `metadata.version`에 `1.0.0`을 사용합니다. 새로운 Skill의 동작이 기존 플러그인에 추가되면 플러그인 버전은 호환 가능한 minor 증가로 정합니다.

## 지정한 플러그인에 Skill을 추가할 때

- Skill 폴더 이름, frontmatter 이름, `agents/openai.yaml`에서 호출하는 이름을 일치시킵니다.
- 요청 기능을 수행하는 데 필요한 `SKILL.md`만 작성합니다. 조건부 절차, 자료표, 긴 예시는 필요한 경우에만 연결된 references로 나눕니다.
- 새 한국어 설명은 존댓말로 작성합니다. 표준 식별자, command, path, URL과 고정된 API 필드명은 필요한 경우 원문을 유지합니다.
- 대상 플러그인의 README 표에 Skill 링크, 버전, 사용 시점과 역할을 추가하고, manifest와 marketplace 버전을 맞춥니다.
- 새 KP 플러그인의 `.claude-plugin/plugin.json`에는 `dependencies: ["kp-skill-manager@kp-skill"]`를 선언합니다. `kp-skill-manager` 플러그인 자체에는 자기 의존성을 추가하지 않습니다. Skills CLI를 쓰는 프로젝트 로컬 설치 안내에는 manager 전체를 같은 agent 경로에 먼저 설치하는 명령과 동의 절차를 포함합니다.
- 새 Skill과 플러그인의 역할·연결은 [KP Skill 관계표와 생성·버전·네이밍 원칙](../kp-skill-install/references/kp-skill-catalog-and-authoring.md)에 추가합니다. 관계표에는 실제로 이어지는 작업만 적고 무조건 함께 실행하는 흐름으로 작성하지 않습니다.
- 다른 플러그인이나 사용자의 설치 경로는 추가 요청 없이 변경하지 않습니다.

## 계정·권한·배포 경계

- 새 Skill은 기본적으로 사용자가 지정한 프로젝트에 초안으로 만듭니다. Codex는 `<project>/.agents/skills/<skill-name>/`, Claude Code는 `<project>/.claude/skills/<skill-name>/`를 사용하고, 명시적인 요청 없이 전역 경로나 정본 저장소를 수정하지 않습니다.
- 사용자가 `kp-skill` 정본에 추가하거나 배포해 달라고 명시한 경우에만 초안을 정본 후보로 승격합니다. 먼저 [KP Skill 관계표와 생성·버전·네이밍 원칙](../kp-skill-install/references/kp-skill-catalog-and-authoring.md)을 읽고 정본 반영 범위를 확인합니다.
- 활성 로그인은 `gh api user --jq .login`으로 확인하고 Git author·committer가 같은 계정인지 검증합니다. 로그인 계정이 관리자([bwlee-dix](https://github.com/bwlee-dix))이면 fork하지 않고 `kingdompla-net/kp-skill`의 로컬 정본 체크아웃을 사용합니다. `origin`이 정본 저장소인지 확인한 뒤 `main`을 fetch합니다. 체크아웃이 깨끗하면 `git pull --ff-only origin main`을 실행하고, 미커밋 변경이 있으면 이를 보존한 채 `origin/main`에서 별도 작업 브랜치나 worktree를 만듭니다.
- 관리자 계정은 별도 승인 없이 작업 브랜치에 커밋·push하고 정본 `main` 대상 PR을 생성할 수 있습니다. 필수 검사가 통과하고 병합을 막는 조건이 없으면 추가 승인을 기다리지 않고 PR을 병합합니다. 리뷰 승인만 요구되는 경우에만 관리자 우회를 사용하며, 실패한 검사나 다른 필수 병합 조건은 우회하지 않습니다. 정본 branch에 직접 push하지 않습니다.
- 다른 GitHub 계정이면 먼저 upstream의 fork를 만들고 해당 fork를 로컬에 가져와 작업 브랜치에서 수정합니다. 정본 저장소의 기본 branch를 대상으로 PR을 생성하고, 관리자가 실제 병합할 때까지 기다립니다. 관리자의 로컬 clone이나 사용자의 다른 체크아웃에 의존하지 않습니다.
- tag push, GitHub Release, marketplace 갱신은 사용자가 명시적으로 릴리스를 요청한 경우에만 진행합니다. PR 생성이나 병합을 릴리스·배포의 증거로 취급하지 않습니다.
- 변경 전후 파일 목록, 링크와 manifest 정합성, Skill frontmatter 및 버전을 검증합니다. 검증되지 않은 Skill을 marketplace에 등록했다고 보고하지 않습니다.

## 종료 보고

추가한 플러그인 또는 Skill의 경로, 버전, 바뀐 목록 문서, 검증 결과와 남은 승인·배포 단계를 구분해 보고합니다.

## KP Skill 연결과 관리자 기준

- 새 Skill을 만들거나 프로젝트 로컬 Skill을 정본 후보로 가져오기 전에 [KP Skill 관계표와 생성·버전·네이밍 원칙](../kp-skill-install/references/kp-skill-catalog-and-authoring.md)을 읽고 적용합니다.
- 이 Skill은 `kp-skill-manager` 플러그인의 일부이므로 manager 자체의 설치 동의를 다시 요구하지 않습니다. 사용자가 manager 설치를 요청하면 전체 manager Skill을 같은 프로젝트·에이전트 범위에 설치합니다.
- 다른 KP Skill이 필요해지면 관계표를 따라 연결합니다. 해당 Skill이 현재 프로젝트·에이전트 경로에 없으면 필요한 이유와 이름을 설명하고 설치 동의를 받은 뒤에만 설치합니다. 전역 설치는 하지 않습니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-skill-create/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-skill-create/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 manager 전체 설치 절차는 [플러그인 안내](../../README.ko.md)를 확인합니다.
