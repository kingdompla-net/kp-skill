# 버전·릴리스·이전 콘텐츠 재발행 기준

## 버전 정본

- 개별 Skill의 정본은 해당 `SKILL.md` frontmatter의 `metadata.version`입니다.
- 플러그인 정본은 `.claude-plugin/plugin.json`의 `version`입니다. 루트 `.claude-plugin/marketplace.json`의 해당 plugin entry도 같은 값이어야 합니다.
- 플러그인 README의 버전과 Skill 표의 각 버전은 정본을 사람이 읽기 쉽게 반영합니다. 버전을 바꿀 때 영문·한국어 README와 marketplace를 함께 맞춥니다.
- 현재 사용자용 설치 파일만 수정하지 않습니다. 정본을 고친 뒤 설치 경로를 갱신합니다.

## SemVer 기준

| 증가 | 사용 기준 |
| --- | --- |
| patch | 기존 의미와 호출 방식을 유지하는 문서 수정, 설명 오류나 검증 누락 수정 |
| minor | 이전 동작과 호환되는 사용법·능력·템플릿·Skill 추가 |
| major | Skill 이름, plugin 식별자, 핵심 입력·출력, 기본 동작 또는 기존 소비자 계약 변경 |

변경된 개별 Skill의 버전은 해당 내용만을 기준으로 올립니다. 플러그인 버전은 배포 단위의 변경 전체를 기준으로 별도로 올립니다. 기존 plugin의 새 Skill 추가는 호환 가능한 minor 증가가 기본이며, 새 plugin의 첫 릴리스는 `1.0.0`으로 시작합니다. 숫자 선택을 사용자에게 묻지 않습니다.

## Git tag 규칙과 변경 이력

- 플러그인 태그: `<plugin>/v<plugin-version>`
- 개별 Skill 태그: `<plugin>/<skill>/v<skill-version>`
- 예시: `kp-api-skill/v1.2.0`, `kp-api-skill/kp-api-endpoint/v1.1.1`
- 태그는 정확한 배포 commit을 가리키는 annotated tag로 만들고, tag message에 한글 변경 요약을 기록합니다.
- 공개한 tag는 이동하거나 삭제하지 않습니다. 버전 이력 표는 Git tag와 tag message에서 가져오며, tag가 없는 버전을 배포 이력처럼 만들지 않습니다.

## 이전 Skill 콘텐츠를 새 버전으로 재발행

여기서 “롤백”은 branch나 tag를 과거로 되돌리거나 marketplace 버전을 낮추는 뜻이 아닙니다. 선택한 이전 버전의 Skill 패키지 내용을 복구하고, 현재보다 높은 새 버전으로 GitHub와 연결된 marketplace에 다시 게시해 과거 동작을 제공하는 작업입니다. 기존 설치본은 provider별 업데이트 후에 새 버전을 받습니다.

1. 사용자가 원본 버전을 지정했는지 확인합니다. 지정하지 않았다면 선택 가능한 과거 버전과 tag를 보여드리고 복원 대상을 확인받습니다.
2. 선택한 과거 Skill tag가 존재하는지와 대상 Skill 디렉터리를 확인합니다.
3. 대상 Skill 디렉터리의 콘텐츠를 과거 tag의 같은 경로와 일치시킵니다. `SKILL.md`의 `metadata.version`만은 현재 버전에서 앞으로 증가시키며, 다른 Skill·무관한 파일·사용자 변경은 보존합니다.
4. 복구로 달라지는 동작 영향에 맞춰 Skill SemVer를 올립니다. 새 버전은 복원 원본 버전이 아니라 현재 공개 버전을 기준으로 선택합니다.
5. plugin 버전도 올리고 plugin manifest, marketplace catalog, README와 새 Git tag에 같은 plugin 버전을 기록합니다. 새 Skill 버전은 해당 Skill의 metadata와 Skill 버전 표에 기록합니다.
6. 사용자 승인 후 GitHub의 새 commit과 tag를 게시하고, 연결된 marketplace를 동기화해 새 plugin 버전이 노출되는지 확인합니다. 각 agent의 설치본 갱신은 provider별 절차에 따라 따로 확인합니다.
7. 복원 원본 tag, 새 버전, GitHub 반영과 marketplace별 동기화 결과를 기록합니다.

GitHub branch의 코드가 과거 콘텐츠와 같아도 GitHub tag, marketplace catalog와 설치본이 자동으로 갱신된다는 뜻은 아닙니다. 각 단계를 [provider별 안내](../../kp-skill-install/references/marketplace-updates.md)에 따라 완료하고 검증합니다.
