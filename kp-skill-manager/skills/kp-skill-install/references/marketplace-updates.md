# Marketplace와 로컬 설치 갱신 안내

확인일: 2026-10-22

각 agent의 plugin marketplace는 버전 판정, ref 추적, refresh 방식이 다릅니다. GitHub tag를 생성했다는 사실만으로 설치본이 함께 갱신되지는 않습니다.

## Skills CLI로 복사한 Skill

프로젝트/사용자 Skill 설치는 [Skills CLI 명령 안내](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)의 `skills list`, `skills check`, `skills update`를 사용합니다. CLI는 설치 lock의 source/ref와 원격 Skill 폴더 해시를 바탕으로 업데이트를 확인합니다. 프로젝트에는 `--project`, 사용자 공용 설치에는 사용자가 명시한 경우에만 `--global`을 지정합니다.

`metadata.version`은 이 저장소가 제공하는 Skill의 사람이 읽는 SemVer 정본입니다. CLI가 remote folder content를 가져오고 설치본을 바꾸는지 확인하는 동작은 plugin manifest 버전과 별개입니다. 특정 프로젝트의 lock이 과거 branch/tag 또는 다른 source를 가리키면 최신 정본을 받았다고 주장하지 말고 source ref를 먼저 확인합니다.

한 번의 `npx skills update`가 모든 agent의 native plugin registry를 바꾸지는 않습니다. 대상 scope의 lock과 설치 경로를 확인하고 update 전후 Skill frontmatter와 실제 파일을 검증합니다.

## Claude Code plugin marketplace

[Claude Code plugin 관리 문서](https://code.claude.com/docs/en/plugins/install)에 따라 marketplace 목록을 `claude plugin marketplace list`로 확인합니다. 먼저 `claude plugin marketplace update <marketplace>`로 catalog를 새로 읽은 다음 실제 설치된 특정 plugin은 `claude plugin update <plugin>@<marketplace>`로 갱신합니다. marketplace update만으로는 모든 설치 plugin의 버전이 바뀌지 않습니다. marketplace UI에서 marketplace 전체 업데이트를 지원할 수도 있으며, 모든 marketplace의 모든 plugin을 한 번에 갱신하는 단일 shell 명령은 확인되지 않았습니다.

[Claude marketplace 참조](https://code.claude.com/docs/en/plugin-marketplaces)는 plugin의 `plugin.json` version이나 marketplace entry version을 업데이트 판정에 사용합니다. 같은 버전 문자열이 유지되면 plugin 파일 변경이 update로 감지되지 않을 수 있으므로 두 manifest 버전을 함께 올립니다. marketplace를 특정 tag/ref에 고정한 경우 그 pin은 해당 tag/ref를 추적합니다. 새 release tag 생성만으로 pin이 새 tag로 이동하지 않습니다.

갱신으로 설치 파일이 바뀌어도 이미 실행 중인 세션은 예전 내용을 유지할 수 있습니다. CLI 출력에 reload 필요 여부가 나타나면 `/reload-plugins` 또는 새 세션으로 실제 반영을 확인합니다.

## Codex native plugin marketplace

[OpenAI plugin packaging 안내](https://developers.openai.com/plugins/build/plugins)에 따라 로컬 설정된 marketplace는 `codex plugin marketplace list`로 source와 경로를 확인하고 `codex plugin marketplace upgrade [marketplace-name]`로 갱신합니다. Git marketplace가 `--ref`로 branch/tag에 고정돼 있으면 그 ref의 내용을 가져오므로 고정 tag를 최신이라고 간주하지 않습니다.

Codex local marketplace의 plugin은 marketplace entry가 가리키는 plugin 디렉터리를 실제로 갱신해야 합니다. local plugin 파일을 업데이트한 후에는 ChatGPT desktop app을 재시작해 새 파일을 읽는지 확인합니다. workspace 관리형 plugin은 이 로컬 명령으로 바뀌지 않습니다.

## ChatGPT workspace marketplace

[GitHub marketplace import·sync 안내](https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github)에 따르면 workspace marketplace는 정기 sync를 하거나 관리자 화면에서 sync를 요청할 수 있습니다. 개인 로컬 Skill 관리자가 workspace 설치 정책이나 연결된 marketplace 내용을 대신 수정할 수는 없습니다. admin 권한과 연결 도구가 확인되지 않으면 새 commit/tag만으로 workspace에 반영됐다고 말하지 않습니다.

## 이전 콘텐츠 재발행 후 업데이트

- default branch를 추적하는 설치: 변경을 병합하고 plugin/Skill version을 올린 뒤 provider가 catalog/source를 새로 읽고 설치본을 갱신해야 합니다.
- branch/tag에 고정된 설치: 새 tag를 만들어도 기존 pin은 유지됩니다. 업데이트할 때 정확한 설치 source/ref가 어떻게 움직이는지 확인해야 합니다.
- 이전 Skill 콘텐츠를 새 버전으로 재발행하는 경우: 과거 Skill 패키지 콘텐츠를 새 commit으로 복원하고, 현재보다 높은 Skill·plugin 버전과 새 release tag로 GitHub 및 연결된 marketplace를 갱신합니다. 이후 provider refresh와 실제 설치본 버전 검증을 각각 수행합니다.
- GitHub release 페이지, tag push, PR merge, marketplace sync, local file update는 각각 다른 완료 증거입니다. 하나의 결과로 다른 단계를 완료했다고 표현하지 않습니다.
