# Pull Request 규칙

- 브랜치 이름은 소문자 영문 ASCII, 숫자, 하이픈만 사용한다. 한글이나 그 밖의 비 ASCII 문자는 사용하지 않는다.
- 회사 저장소의 PR 제목은 영어 `Conventional Commits` 형식(`<type>(<scope>): <description>`)으로 작성한다.
- `kingdompla-net/kingdom-planet-center` 저장소는 사용자가 다른 base를 지정하지 않는 한 `dev`를 PR base로 사용한다.
- 기본 PR 템플릿은 `/Users/byungskersmacbook/.codex/templates/PULL_REQUEST_TEMPLATE.md`를 사용한다. 대상 저장소의 `.references/PULL_REQUEST_TEMPLATE.md`에는 같은 템플릿을 보관하고 정본과 일치시킨다.
- 저장소에 `.github/PULL_REQUEST_TEMPLATE.md`가 있으면 GitHub PR에는 그 저장소 로컬 사본을 사용하고 정본과 일치시킨다.
- 모든 PR 본문에는 정확한 메타데이터 필드 `Target-Delivery-Unit`, `Target-Version`, `Delivery-Profile`을 포함한다. 값을 추측하지 말고 승인된 이슈, 로드맵, 브랜치, base 또는 릴리스 맥락에서 확인한다.
- PR 하나는 하나의 전달 맥락에 집중한다. 구현과 직접 테스트를 함께 포함하고, 해당 전달 단위에 필요하지 않은 정리·증거·문서·생성 파일은 제외한다.
- 커밋 전에 제안하는 PR 범위, 변경 경로, diff 요약, 검증 결과, 위험, 완성된 PR 템플릿 초안을 보고하고 사용자의 명시적 승인을 기다린다.
- 승인 후 승인된 경로나 hunk만 stage하고 staged diff를 검토한 뒤 커밋한다. 승인된 템플릿으로 PR을 생성한다. push, merge, deploy, release는 각각 관련된 명시적 승인이 있을 때만 한다.
- PR 하나의 커밋은 7개 이하로 유지한다. 3~5개를 선호하고, 7개를 넘기기 전에 전달 맥락을 분리한다.
- 관련 없는 수정·미추적 파일은 보존한다. PR 경계를 만들기 위해 광범위한 reset, checkout, stash, cleanup, stage 작업을 하지 않는다.
