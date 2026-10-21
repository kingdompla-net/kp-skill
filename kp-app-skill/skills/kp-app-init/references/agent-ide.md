# 에이전트별 Biome·ESLint IDE 설정

기준 스킬 README: [biome-eslint-ide-config-skill](https://github.com/byungsker/opengiver-skills/blob/main/plugins/biome-eslint-ide-config-skill/README.ko.md). 확인한 문서 버전은 1.1.0이다. 설치 전에 최신 README와 해당 에이전트의 설치 지원을 다시 확인한다.

## 실행 원칙

1. 초기화 대상 저장소의 루트 경로를 확인하고, 설치 명령을 실행하기 전에 작업 디렉터리를 그 저장소 루트로 맞춘다.
2. 현재 대화의 실제 에이전트를 확인하고 해당 에이전트 하나만 선택한다. 사용자의 홈 디렉터리나 전역 Skill 경로에 설치하지 않는다.
3. 스킬이 이미 있는지 확인할 때는 대상 저장소 안의 해당 에이전트 프로젝트 경로만 확인한다. 사용자의 전역 경로에만 설치된 스킬은 대상 저장소 설치로 인정하지 않고, 대상 저장소에 별도로 설치한다.
4. 대상 저장소 루트에서 README의 공용 설치 방식을 사용한다. `--global` 또는 `-g` 옵션은 붙이지 않는다. 아래는 에이전트별 명령 예시이며 현재 사용할 에이전트에 해당하는 한 줄만 실행한다.

   ~~~sh
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent codex --copy --yes
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent claude-code --copy --yes
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent hermes-agent --copy --yes
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent openclaw --copy --yes
   ~~~

   위 명령은 선택지다. 네 명령을 모두 실행하지 않는다. `--copy`는 파일을 대상 저장소에 복사한다.

5. 설치 후 스킬 파일이 대상 저장소의 프로젝트 경로에 생겼는지 확인한다. 대표 경로는 Codex의 `.agents/skills/biome-eslint-ide-config-skill/`, Claude Code의 `.claude/skills/biome-eslint-ide-config-skill/`, Hermes Agent의 `.hermes/skills/biome-eslint-ide-config-skill/`, OpenClaw의 `skills/biome-eslint-ide-config-skill/`이다. 다른 에이전트는 최신 설치 문서의 프로젝트 경로를 확인한다. 명령이 사용자의 홈 디렉터리나 전역 경로에 설치하려고 하면 실행하지 말고 프로젝트 경로를 지원하는 절차를 확인한다.

6. 설치된 프로젝트 경로에서 현재 에이전트의 Skill 호출 방식으로 biome-eslint-ide-config-skill을 실행해 저장소에 필요한 설정을 적용한다. CLI가 없다고 바로 결론 내리지 말고 해당 에이전트 문서의 설치 위치와 실행 파일을 확인한다.
7. 그 스킬은 현재 package manager, Biome·ESLint·Tailwind 버전, 기존 editor 설정을 조사하고 설정 기본안에 대해 묻는다. 그 설정 질문을 생략하지 않는다. 설정이 완료된 뒤 전체 저장소 autofix를 실행할지는 별도 확인이 필요하다. 사용자가 승인하지 않으면 대표 파일 검증까지만 한다.

설치 방식이 바뀌었으면 README의 최신 절차와 대상 에이전트의 프로젝트 설치 경로를 확인한다. 설치·설정 결과는 대상 저장소 변경으로 검토하고, 전역 사용자 설정을 임의로 수정하지 않는다.
