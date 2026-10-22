# Pull Request 규칙

- 브랜치 이름은 소문자 영문 ASCII, 숫자, 하이픈만 사용한다. 한글이나 그 밖의 비 ASCII 문자는 사용하지 않는다.
- `main`/`dev`에서 직접 작업하지 않는다. 작업마다 최소한 별도 작업 브랜치를 만들고, 권장 방식은 작업별 워크트리와 브랜치를 함께 만드는 것이다.
- `main`/`dev`에 직접 push하려면 push 직전에 매번 사용자의 명시적 승인을 받는다. PR 생성이나 커밋 승인은 직접 push 승인으로 간주하지 않는다.
- 회사 저장소의 PR 제목은 영어 `Conventional Commits` 형식(`<type>(<scope>): <description>`)으로 작성한다.
- `kingdompla-net/kingdom-planet-center` 저장소는 사용자가 다른 base를 지정하지 않는 한 `dev`를 PR base로 사용한다.
- 기본 PR 템플릿은 `/Users/byungskersmacbook/.codex/templates/PULL_REQUEST_TEMPLATE.md`를 사용한다. 대상 저장소의 `.references/PULL_REQUEST_TEMPLATE.md`에는 같은 템플릿을 보관하고 정본과 일치시킨다.
- 저장소에 `.github/PULL_REQUEST_TEMPLATE.md`가 있으면 GitHub PR에는 그 저장소 로컬 사본을 사용하고 정본과 일치시킨다.
- PR 하나는 하나의 전달 맥락에 집중한다. 구현과 직접 테스트를 함께 포함하고, 해당 전달 단위에 필요하지 않은 정리·증거·문서·생성 파일은 제외한다.
- 커밋 전에 제안하는 PR 범위, 변경 경로, diff 요약, 검증 결과, 위험, 완성된 PR 템플릿 초안을 보고하고 사용자의 명시적 승인을 기다린다.
- 승인 후 승인된 범위의 각 작업 맥락이 구현·직접 검증될 때마다 해당 경로나 hunk만 stage하고 staged diff를 검토해 독립 커밋으로 남긴다. 모든 맥락의 검증이 끝나면 승인된 템플릿으로 확인된 base 대상 PR을 생성하고, 필수 검사와 리뷰 요청이 해결된 뒤 PR을 base에 병합한다. 이 PR 생성·병합은 승인받은 작업을 완료하는 기본 절차다.
- PR을 거치지 않고 작업 브랜치를 base에 직접 병합하는 경우에는 실행 전에 사용자의 별도 명시적 승인을 받는다. `main`/`dev` 직접 push도 push 직전에 매번 별도의 명시적 승인을 요구한다. 배포와 release는 사용자가 별도로 명시적으로 요청해야 한다.
- 필수 검사가 실패하거나 미해결 리뷰·브랜치 보호 조건 때문에 PR 병합을 완료할 수 없으면 우회하지 말고 현재 상태와 남은 조건을 보고한다.
- PR 하나의 커밋은 7개 이하로 유지한다. 3~5개를 선호하고, 7개를 넘기기 전에 전달 맥락을 분리한다.
- 관련 없는 수정·미추적 파일은 보존한다. PR 경계를 만들기 위해 광범위한 reset, checkout, stash, cleanup, stage 작업을 하지 않는다.
