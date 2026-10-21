# 커밋 메시지 규칙

- 커밋 제목은 영어 `Conventional Commits` 형식(`<type>(<scope>): <description>`)으로 작성한다.
- `type`은 변경 성격이고 괄호 안의 `scope`는 변경 영역이다. 에이전트 설정·지침·스킬·하네스·리뷰 운영 등 에이전트 관련 작업은 `scope`를 반드시 `agents`로 지정한다. 예: `docs(agents): update repository agent instructions`.
- 커밋 본문은 한글로 작성하고, 변경 내용을 설명하는 각 항목은 `-` 불릿으로 작성한다.
- 저장소나 작업 범위에 별도 커밋 메시지 레퍼런스가 있으면 이 원칙을 기준으로 해당 레퍼런스의 구체적인 범위를 따른다.
- 모든 작업은 기능이나 수정 목적별 맥락으로 나눈다. 한 맥락의 구현과 직접 관련 테스트·검증이 끝나면 그 변경만 독립 커밋으로 남기고 다음 맥락으로 넘어간다. 서로 다른 맥락을 하나의 커밋으로 묶거나, 모든 작업이 끝날 때까지 커밋을 미루지 않는다.
- PR 규칙에 따라 승인된 전달 범위와 경로 안에서 커밋한다. 맥락별 커밋에도 같은 author·committer 계정 검증과 staged diff 검토를 적용한다.
- 커밋 전에 활성 GitHub 계정과 `git var GIT_AUTHOR_IDENT`, `git var GIT_COMMITTER_IDENT`를 확인한다. author와 committer 이름은 `AGENTS.local.md`에 정한 값이어야 하고, 두 이메일은 모두 같은 GitHub 계정에 인증된 이메일 또는 그 계정의 noreply 주소여야 한다. 계정이 다르거나 확인할 수 없으면 커밋하지 않는다.
