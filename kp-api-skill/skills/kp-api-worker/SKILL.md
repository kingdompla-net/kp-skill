---
name: kp-api-worker
description: "KP API 기능을 HTTP 요청에서 분리해 Cloud Tasks 또는 Scheduler 기반 비동기 worker로 구현할 때 사용합니다."
metadata:
  version: "1.0.0"
---

# KP API worker 구현

worker는 응답 시간 제한, 긴 처리, 외부 retry, 정기 실행, 서로 다른 확장·권한 경계처럼 구체적인 요구가 있을 때만 추가합니다. 짧은 동기 endpoint의 기본 구현으로 worker를 도입하지 않습니다.

## 설계와 구현

1. 기존 저장소의 `AGENTS.md`, codebase와 함수 exports, queue/scheduler, runtime service account, 테스트 구조와 관련 API 흐름을 확인합니다. [`kp-api-init` 저장소 분석](../kp-api-init/references/api-project-architecture.md)의 QT 설명은 사례로만 참고하고 자원 이름과 credential을 복사하지 않습니다.
2. 처리 시간을 늘리는 것만으로 해결되지 않는 이유를 확인합니다. 비동기 응답·상태 조회·retry·예약 실행 중 필요한 contract만 선택합니다. request가 worker를 enqueue하고 진행 상태를 조회한다면 client/server 계약을 함께 문서화합니다.
3. Queue message에는 최소 식별자·버전·idempotency key만 넣고 사용자 비밀이나 원문 token을 넣지 않습니다. payload schema를 검증하고 허용되지 않은 queue나 작업 유형은 거부합니다.
4. at-least-once 실행과 중복 전달을 가정합니다. durable idempotency, lease 또는 compare-and-set, fencing token/작업 버전, 재시도 가능 오류와 영구 오류 구분, 정리 정책을 현재 DB 계약에 맞춰 구현합니다. 메모리 잠금만으로 인스턴스 간 중복을 해결했다고 보고하지 않습니다.
5. retry 횟수·backoff·max dispatch rate·동시 실행·max instances·timeout을 작업 비용과 부작용에 맞춰 제한합니다. 독립성이 없다면 함수 전체 concurrency를 1로 낮추지 말고 필요한 범위를 확인합니다.
6. Scheduler는 timezone과 cadence를 명시합니다. 반복 trigger가 중복 실행되어도 안전한지 검증합니다. Worker는 기본적으로 비공개로 두고 enqueue 주체에 정확한 queue 범위만 허용합니다. Public invoker가 필요하다면 보안 요구와 repository policy의 근거를 확인합니다.
7. 중복 delivery, retry, lease expiry/stale worker, 부분 실패, terminal state, invalid payload, queue identity mismatch를 검증합니다. 외부 API는 mock/emulator로 대체하고 실제 부작용을 실행하지 않습니다. 필요한 emulator 검증은 [`kp-api-test-deploy`](../kp-api-test-deploy/SKILL.md)를 따릅니다.

## 권한·비밀

Runtime service account는 worker가 실제로 호출하는 서비스에 필요한 권한만 받습니다. deploy identity와 runtime identity를 같다고 가정하지 않습니다. API key·DB credential·3rd-party token은 Firebase Secret Manager에 두고 사용하는 function에만 bind합니다. IAM 변경이나 secret 생성은 코드 변경과 분리해 권한 관리자·배포 절차를 따릅니다.

worker를 실제 배포하려면 사용자가 환경을 지정해 요청해야 하며, `$kp-api-deploy`에서 해당 function 또는 codebase 범위를 확인합니다.

## KP Skill 관계와 관리자 설치

- 이 Skill을 프로젝트에서 사용할 때는 동일한 프로젝트·에이전트 경로에 `kp-skill-manager`의 세 Skill이 있는지 확인합니다. 없으면 manager의 역할과 필요한 설치 경로를 설명하고 설치 동의를 받은 뒤에만 manager 전체를 프로젝트 로컬로 설치합니다. 거부하면 KP Skill 작업을 진행하지 않습니다. 사용자가 manager 설치를 직접 요청한 경우는 설치 동의로 봅니다.
- 다른 KP Skill이 필요해지면 아래 정본 문서 또는 현재 에이전트의 `.agents/skills/kp-skill-install/references/`나 `.claude/skills/kp-skill-install/references/`에 있는 관계표를 읽습니다. 필요한 Skill이 없으면 이유와 이름을 알리고 추가 설치 동의를 구합니다. 동의한 Skill만 설치하며 관계표의 모든 Skill을 무조건 실행하지 않습니다.
- 정본 관계표: `kp-skill-manager/skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md`.
