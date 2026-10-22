---
name: kp-skill-release
description: "KP Skill을 개선해 적절한 SemVer로 배포하거나, 플러그인·Skill 버전 이력을 확인하고 이전 버전의 Skill 콘텐츠를 더 높은 새 버전으로 재발행할 때 사용합니다."
metadata:
  version: "1.0.0"
---

# KP Skill 버전 관리와 릴리스

지정된 플러그인이나 Skill의 정본을 확인하고, 변경 영향에 맞는 SemVer를 적용해 승인된 경로로 릴리스합니다. 버전을 사용자에게 지정해 달라고 요청하지 말고 실제 변경에서 적절한 증가 폭을 선택합니다.

릴리스를 요청받지 않은 로컬 수정·검토 단계에서는 버전값을 올리지 않습니다. 사용자가 승인한 릴리스 범위의 검증이 끝난 뒤, 승인된 게시 절차를 시작할 때 Skill·plugin·marketplace 버전을 함께 올립니다.

## 릴리스 시작

1. 저장소 루트, 적용되는 `AGENTS.md`, 현재 branch, upstream과 `git status --short --branch`를 확인합니다. 기존 dirty·untracked 변경을 보존하고 릴리스 범위와 분리합니다.
2. 대상 plugin 또는 Skill과 현재 정본 버전을 확인합니다. Skill은 frontmatter의 `metadata.version`, 플러그인은 해당 plugin manifest 버전을 사용합니다.
3. 활성 GitHub 로그인은 `gh api user --jq .login`으로 확인합니다. `gh`가 실행되지 않으면 PATH와 설치 경로를 검사하고, 다른 인증 계정으로 단정하지 않습니다. GitHub 로그인과 Git author·committer identity가 일치하는지도 확인합니다.
4. 대상 디렉터리의 전체 변경을 검토하고 연관 테스트와 Skill validator를 실행합니다. 새 버전은 README 표, plugin manifest, root marketplace와 일치해야 합니다.

릴리스를 준비하기 전에 [KP Skill 관계표와 생성·버전·네이밍 원칙](../kp-skill-install/references/kp-skill-catalog-and-authoring.md)을 읽고 영향받는 Skill, plugin, 사용자 프로젝트 설치본을 식별합니다.

## SemVer 선택

- `patch`: 의미와 기존 사용 방식을 바꾸지 않는 설명·예시·오류 수정입니다.
- `minor`: 이전 사용 흐름과 호환되는 새 기능, 명확한 절차, 새 Skill 또는 선택적 reference를 추가합니다.
- `major`: Skill 이름·호출 방식, 주요 입력·결과, plugin 식별자나 기존 동작 계약을 깨뜨립니다.
- 확실한 호환성 근거가 없으면 보수적으로 더 큰 증가를 선택하고 근거를 변경 요약에 적습니다. 버전 숫자를 사용자에게 묻지 않습니다.
- 변경한 Skill만 자체 버전을 올립니다. 해당 플러그인의 버전도 영향에 맞게 올리고, `SKILL.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, 플러그인 README 양쪽 언어와 저장소 목록에 같은 plugin 버전을 기록합니다. Skill README 표에는 각 개별 Skill의 버전을 기록합니다.
- PR 본문에는 저장소 지침이 요구하는 `Target-Delivery-Unit`, `Target-Version`, `Delivery-Profile` 필드를 포함하고, 승인된 이슈·로드맵·브랜치·base·릴리스 맥락에서 값을 확인합니다. `Target-Version`은 변경 영향에 맞춰 에이전트가 SemVer로 선택하며 사용자에게 버전 번호를 묻지 않습니다.

## 계정에 따른 경로

- GitHub 로그인 계정과 Git author·committer가 일치하는지 확인합니다. kp-skill 관리자([bwlee-dix](https://github.com/bwlee-dix))가 Ruleset 우회 권한을 갖더라도 저장소 절차에 따라 PR을 만들고 기본 branch에 병합한 뒤 배포합니다.
- 관리자 권한은 직접 push, PR 없는 merge, tag push 또는 release 승인을 대신하지 않습니다. 직접 반영은 사용자의 별도 명시적 승인과 저장소 규칙이 허용하는 경우에만 수행합니다.
- PR 생성 경로에서는 commit 전에 저장소 지침에 따라 scope, 변경 경로, diff, 검증, 위험과 PR 초안을 보고하고 명시적 승인을 받습니다. 승인 뒤 선택된 파일만 stage하고 staged diff를 확인합니다.
- 사용자가 승인하지 않은 commit, push, merge, GitHub Release 또는 tag push를 실행하지 않습니다. PR을 열었으면 merge 전까지 배포 완료로 보고하지 않습니다.

## 버전 이력 조회

[버전·릴리스·이전 콘텐츠 재발행 기준](references/versioning-and-rollback.md)의 tag 규칙으로 plugin과 Skill을 구분합니다. 기존 Git tag와 annotated message를 읽어 다음 표로 정리합니다.

| 버전 | 변경사항 | 태그 |
| --- | --- | --- |

해당 대상의 tag가 없으면 기록을 만들지 말고 아직 태그된 릴리스가 없다고 표시합니다. README의 현재 버전과 tag history를 같은 정보로 취급하지 않습니다.

## 이전 Skill 콘텐츠를 새 버전으로 재발행

이 절차에서 사용자가 말하는 “롤백”은 Git branch나 tag를 과거로 되돌리거나 marketplace 버전 숫자를 낮추는 작업이 아닙니다. 지정한 과거 배포의 Skill 콘텐츠를 현재 정본에 복원하고, 더 높은 새 버전으로 GitHub와 연결된 marketplace에 다시 게시해 이전 동작을 제공하는 작업입니다. 기존 설치본은 provider별 업데이트를 거쳐 새 버전을 받습니다.

- 사용자가 지정한 이전 배포 tag가 실제로 존재하는지 확인합니다. 사용자가 원본 버전을 정하지 않았다면 선택 가능한 과거 버전과 tag를 제시하고, 어느 버전의 콘텐츠를 복원할지 확인받습니다.
- 확인된 tag에 포함된 대상 Skill 디렉터리 전체를 복원 범위로 삼습니다. 여기에는 `SKILL.md`, `agents/`, `references/`, `scripts/`, `assets/`가 포함될 수 있습니다.
- 대상 Skill의 이전 버전 콘텐츠를 해당 tag와 동일하게 복구합니다. 단, `SKILL.md`의 `metadata.version`은 현재 배포 버전보다 앞으로 증가시킵니다. plugin의 다른 Skill, 무관한 파일, 사용자의 기존 변경은 보존합니다.
- Skill의 현재 동작에서 복원 동작으로 바뀌는 영향에 맞춰 SemVer를 선택하고, plugin 버전도 올립니다. 과거 tag나 main branch를 force-update하거나 삭제하지 않습니다.
- 승인된 릴리스 절차에서 GitHub의 새 commit과 annotated tag를 만들고, plugin manifest·marketplace catalog·README의 버전을 일치시켜 새 릴리스로 게시합니다. 연결된 각 agent marketplace도 source/ref와 설치 버전 정책에 맞게 새 버전을 동기화하고, 대상 marketplace에서 새 버전이 확인되는지 검증합니다.
- 재발행 기록에는 대상 Skill, 복원 원본 tag, 새 Skill·plugin 버전, GitHub 릴리스와 marketplace 갱신 결과를 기록합니다.
- branch의 복구 commit, tag, GitHub release, marketplace catalog 동기화, 사용자 설치본 갱신은 각각 별도의 결과입니다. provider별 절차는 [marketplace와 로컬 설치 갱신 안내](../kp-skill-install/references/marketplace-updates.md)를 따르고, 실제 갱신을 수행하지 못한 provider는 미완료로 보고합니다.

## 배포와 확인

릴리스 태그 형식은 `<plugin>/v<plugin-version>`, 개별 Skill은 `<plugin>/<skill>/v<skill-version>`입니다. tag message에 한글 변경 요약을 넣고, 정확한 승인된 commit을 가리키는 annotated tag를 사용합니다.

PR이 실제로 병합된 뒤 default branch의 commit과 버전을 다시 확인하고 tag를 준비합니다. 관리자 계정도 필요한 commit·push 승인을 받기 전에는 branch나 tag를 변경하지 않습니다. tag 생성과 push가 끝나면 연결된 marketplace를 동기화하고 새 버전 노출을 확인합니다. 사용자 설치본 갱신 여부는 설치 범위별로 확인해 따로 보고합니다.

## 검증

- 수정한 모든 Skill의 frontmatter와 로컬 reference 링크를 확인합니다.
- plugin `plugin.json`, root marketplace와 README 양쪽 언어 버전이 JSON 및 버전 일관성 검사를 통과해야 합니다.
- 변경에 맞는 validator, 포맷·문서 링크 검사를 실행하고 결과와 범위를 기록합니다.
- tag를 생성할 때 `git check-ref-format`으로 이름을 확인하고, push한 뒤 원격 tag와 대상 commit을 조회합니다.

## KP Skill 연결과 관리자 기준

- 이 Skill은 `kp-skill-manager` 플러그인의 일부이므로 manager 자체 설치 동의를 다시 요구하지 않습니다. 다른 KP Skill이 필요하면 관계표에서 확인하고, 현재 프로젝트·에이전트 경로에 없을 때는 필요한 이유와 이름을 설명한 뒤 설치 동의를 구합니다.
- 프로젝트 로컬 복사 설치 경로는 Codex의 `<project>/.agents/skills/kp-skill-release/SKILL.md`와 Claude Code의 `<project>/.claude/skills/kp-skill-release/SKILL.md`입니다. 플러그인 이름의 상위 폴더는 만들지 않습니다. 설치 명령과 manager 전체 설치 절차는 [플러그인 안내](../../README.ko.md)를 확인합니다.
- 관리자가 PR 리뷰를 승인한 것만으로 배포가 완료된 것은 아닙니다. PR이 기본 브랜치에 실제로 병합되어 정본에 반영된 뒤에만 배포 완료로 보고합니다.
