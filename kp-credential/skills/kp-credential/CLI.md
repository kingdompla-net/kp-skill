# kp-credential CLI 안내

`kp-credential` Skill 폴더에는 CLI와 npm package가 함께 들어 있습니다. API credential이 필요한 작업에서 에이전트는 `kp-credential --version`으로 설치 여부를 확인하고, 없거나 현재 Skill과 버전이 다르면 설치·갱신 전에 사용자에게 작업과 현재 사용자 npm 전역 prefix를 설명합니다. 그 뒤 이 폴더를 자동 설치·갱신하고 설치된 버전과 실행 경로를 알립니다. 저장소 clone이나 별도 CLI 다운로드는 필요하지 않습니다.

자동 설치에는 Node.js 20 이상, npm, npm registry 접근과 사용자 계정에 쓰기 가능한 npm 전역 prefix가 필요합니다. 필수 조건이 없으면 에이전트가 원인과 해결 방법을 안내한 뒤 준비되면 자동으로 다시 시도합니다. 이때 비밀값을 대화에 보내지 않으며 권한 오류를 우회하려고 `sudo npm`을 사용하지 않습니다.

macOS에서는 Keychain, Windows에서는 Credential Manager를 사용합니다. 명령은 두 OS에서 같습니다.

## 사용자 명령

실제 비밀값은 대화나 명령 인수에 붙이지 않습니다. 아래 `add` 명령을 터미널에서 실행하면 값 입력이 숨겨집니다.

```sh
kp-credential add kp-skill/<저장소>/<환경>/<용도>
kp-credential list
kp-credential info kp-skill/<저장소>/<환경>/<용도>
kp-credential open kp-skill/<저장소>/<환경>/<용도>
kp-credential grant kp-skill/<저장소>/<환경>/<용도> --origin https://api.example.com --path-prefix /v1/resource --header X-API-Key --methods GET
kp-credential request kp-skill/<저장소>/<환경>/<용도> --url https://api.example.com/v1/resource
kp-credential revoke kp-skill/<저장소>/<환경>/<용도> --origin https://api.example.com
kp-credential delete kp-skill/<저장소>/<환경>/<용도>
```

`<...>`는 실제 저장소, 환경, 용도, API 계약에 맞게 채웁니다. `list`는 항목 이름만 보여줍니다. `info`는 저장 여부와 승인된 사용 범위를 확인합니다. `open`은 OS 자격 증명 관리자를 열어 사용자가 직접 값을 확인하도록 합니다. 삭제와 권한 취소에는 대상 항목이나 origin을 다시 확인하는 절차가 있습니다.

`grant`에는 사용자가 승인할 HTTPS origin·path·method·header의 최소 범위만 지정합니다. `Authorization: Bearer` 방식이면 `--header Authorization --prefix 'Bearer '`를 사용하고 실제 credential은 넣지 않습니다. 에이전트는 승인된 범위 안에서만 `request`를 실행합니다. API가 credential을 응답에 그대로 또는 변환해 반사할 수 있다면 해당 endpoint에 권한을 승인하지 않습니다.

## 저장 위치와 경계

- 실제 값은 macOS Keychain 또는 Windows Credential Manager에 저장합니다.
- 항목 이름과 승인 범위만 담는 registry는 macOS의 `~/Library/Application Support/kp-credential/registry.json`, Windows의 `%LOCALAPPDATA%\kp-credential\registry.json`에 저장합니다.
- CLI는 저장된 값을 답변·로그·명령 인수로 출력하지 않고, 임의 CLI 환경 변수나 브라우저 로그인 form에 값을 전달하지 않습니다.
- OS 저장소는 컴퓨터별입니다. 다른 컴퓨터에서는 해당 컴퓨터에도 Skill이 설치되어야 하며, 값을 다시 저장하고 사용 범위를 승인해야 합니다.
- 같은 OS 사용자 계정에서 실행되는 임의 코드까지 격리하지는 않습니다. 신뢰하지 않는 코드를 실행하는 동안에는 이 도구가 같은 계정의 악성 프로세스를 차단한다고 가정하지 않습니다.
