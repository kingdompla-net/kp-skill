# 에이전트별 Biome·ESLint IDE 설정

기준 스킬 README: [biome-eslint-ide-config-skill](https://github.com/byungsker/opengiver-skills/blob/main/plugins/biome-eslint-ide-config-skill/README.ko.md). 확인한 문서 버전은 1.1.0이다. 설치 전에 최신 README와 해당 에이전트의 설치 지원을 다시 확인한다.

## 실행 원칙

1. 현재 대화의 실제 에이전트와 사용자가 작업하는 환경을 확인한다. 시스템에 설치된 모든 에이전트에 무조건 설치하지 말고 현재 사용할 에이전트에 맞는 방식 하나를 고른다.
2. 현재 사용할 수 있는 biome-eslint-ide-config-skill이 이미 있으면 중복 설치하지 않고 그 스킬을 바로 호출한다.
3. 설치가 필요하면 README의 공용 설치 방식에서 현재 에이전트 하나에 해당하는 정확한 명령만 실행한다.

   ~~~sh
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent codex --global --copy --yes --full-depth
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent claude-code --global --copy --yes --full-depth
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent hermes-agent --global --copy --yes --full-depth
   npx skills add https://github.com/byungsker/opengiver-skills --skill biome-eslint-ide-config-skill --agent openclaw --global --copy --yes --full-depth
   ~~~

   위 명령은 선택지다. 네 명령을 모두 실행하지 않는다.

4. 공용 설치가 현재 에이전트에서 지원되지 않으면 README의 네이티브 설치 방식을 확인한다. 문서에 기재된 지원 대상은 Codex(codex), Claude Code(claude-code), Hermes Agent(hermes-agent), OpenClaw(openclaw)다. 예를 들어 Hermes는 다음 경로로 설치한다.

   ~~~sh
   hermes skills install https://raw.githubusercontent.com/byungsker/opengiver-skills/main/plugins/biome-eslint-ide-config-skill/skills/biome-eslint-ide-config-skill/SKILL.md --yes
   ~~~

5. 설치가 끝나면 현재 에이전트의 Skill 호출 방식으로 biome-eslint-ide-config-skill을 실행해 저장소에 필요한 설정을 적용한다. CLI가 없다고 바로 결론 내리지 말고 해당 에이전트 문서의 설치 위치와 실행 파일을 확인한다.
6. 그 스킬은 현재 package manager, Biome·ESLint·Tailwind 버전, 기존 editor 설정을 조사하고 설정 기본안에 대해 묻는다. 그 설정 질문을 생략하지 않는다. 설정이 완료된 뒤 전체 저장소 autofix를 실행할지는 별도 확인이 필요하다. 사용자가 승인하지 않으면 대표 파일 검증까지만 한다.

README에는 Codex와 Claude의 네이티브 plugin 설치, OpenClaw의 clone/copy 방식도 있다. 현재 설치 명령이 바뀌었거나 위 공용 명령을 쓸 수 없으면 README의 최신 절차를 따른다. 설치·설정 결과는 저장소 변경으로 검토하고, 전역 사용자 설정을 임의로 수정하지 않는다.
