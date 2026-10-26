---
name: kp-app-image-optimize
description: "KP React 앱의 로컬 이미지 또는 Firebase Storage 이미지를 분석하고, 실제 화면에 맞게 용량·형식을 최적화할 때 사용합니다."
metadata:
  version: "1.0.0"
---

# KP 앱 이미지 최적화

KP 앱에서 실제 사용하는 이미지의 로딩 비용을 줄이고, 소비 경로와 Firebase Storage metadata를 보존해 최적화 결과를 반영합니다. 이미 충분히 작은 자산은 불필요하게 변환하지 않습니다.

## 시작 확인

1. 대상 저장소의 `AGENTS.md`, 해당 경로의 지침과 `AGENTS.local.md`를 확인하고 기존 변경사항을 보존합니다.
2. 이미지가 사용되는 화면과 실제 출처를 찾습니다. 로컬 asset, KP API 응답 URL, Firebase Storage 객체를 구분하고 표시 크기, 픽셀 크기, 바이트 크기, 포맷, 투명도와 lazy loading 여부를 확인합니다.
3. Firebase Storage를 변경하는 요청이면 정확한 project, bucket, object path와 인증 주체를 확인합니다. 사용자가 명시적으로 업로드를 요청하지 않았다면 원격 파일을 변경하지 않습니다.

## 수행 절차

1. 대상 이미지와 표시 크기에 적합한 인코딩 형식을 고릅니다. 사진에는 WebP를 우선 검토하고, alpha가 필요한 이미지는 이를 보존하는 형식을 사용합니다. 브라우저 지원, 기존 API URL, 파일 경로와 소비 컴포넌트 호환성을 함께 고려합니다.
2. 원본을 보존하고 적절한 픽셀 크기와 인코딩 품질로 최적화본을 만듭니다. 전후의 바이트·픽셀 크기를 비교하고 이미지를 직접 열어 얼굴, 문자, 세부 묘사와 투명도를 확인합니다.
3. 로컬 asset은 import·data 참조와 확장자를 일치시켜 갱신합니다. 참조되지 않는 기존 파일만 제거합니다. KP API가 반환한 URL이나 계약은 근거 없이 바꾸지 않습니다.
4. Firebase Storage의 기존 객체를 덮어쓸 때는 현재 generation을 확인하고 `--if-generation-match`를 적용합니다. `firebaseStorageDownloadTokens` 등 기존 custom metadata와 필요한 content disposition을 보존하고, 실제 바이트에 맞는 `Content-Type`을 설정합니다.
5. URL이 API metadata에 고정되어 확장자를 바꿀 수 없다면, 같은 URL로 새 포맷을 제공하는 방식이 클라이언트와 Firebase URL에서 호환되는지 확인합니다. 호환성을 확인하지 못하면 업로드하지 말고 새 객체 경로와 API metadata 갱신이 필요한지 보고합니다.
6. 변경 후 객체 크기, 포맷, generation, 다운로드 토큰 보존을 확인합니다. 이어 기존 consumer URL 또는 화면에서 실제 새 이미지가 표시되는지 확인합니다. Storage metadata 조회와 브라우저 렌더링 확인은 별개의 증거로 기록합니다.

## 사용하는 API·CLI·도구

| 구분 | API·CLI·도구 | 실제 사용 방식과 명령 | 공식 문서 |
| --- | --- | --- | --- |
| API | KP API image URL·metadata | 해당 endpoint의 response 계약을 read-only로 확인하며 API 동작이나 schema는 변경하지 않습니다. | [DEV Developer Center](https://developer-kpcenter-dev.web.app/api/), [PRD Developer Center](https://developer-kpcenter.web.app/api/)의 endpoint 문서 |
| API | Cloud Storage JSON API | 객체 조회와 업로드는 gcloud 명령이 사용하는 Cloud Storage API 계약을 따릅니다. | [Objects: get](https://cloud.google.com/storage/docs/json_api/v1/objects/get), [Objects: insert](https://cloud.google.com/storage/docs/json_api/v1/objects/insert), [object metadata](https://cloud.google.com/storage/docs/metadata) |
| CLI | Google Cloud CLI (`gcloud`) | 조회: `gcloud storage objects describe gs://<BUCKET>/<OBJECT_PATH> --project=<PROJECT_ID>`<br>승인된 업로드: `gcloud storage cp <OPTIMIZED_FILE> gs://<BUCKET>/<OBJECT_PATH> --if-generation-match=<GENERATION> --content-type=<MIME_TYPE> --content-disposition=<CONTENT_DISPOSITION> --update-custom-metadata=firebaseStorageDownloadTokens=<EXISTING_TOKEN> --project=<PROJECT_ID>`<br>기존 generation·content metadata·download token을 확인하고 보존합니다. | [objects describe](https://cloud.google.com/sdk/gcloud/reference/storage/objects/describe), [storage cp](https://cloud.google.com/sdk/gcloud/reference/storage/cp) |
| CLI | ImageMagick (설치된 경우) | 정보 확인: `magick identify -format '%m %wx%h %b\n' <IMAGE_PATH>`<br>변환: `magick <INPUT_PATH> -resize '<MAX_WIDTH>x<MAX_HEIGHT>>' -quality <QUALITY> <OUTPUT_PATH>` | [command-line](https://imagemagick.org/script/command-line-processing.php), [identify](https://imagemagick.org/script/identify.php) |
| 기타 | 이미지 검사기·브라우저 | 전후 시각 품질과 실제 consumer 렌더링을 확인합니다. 브라우저는 저장소 규칙이 지정한 도구를 사용합니다. | — |

## 검증과 보고

- 최적화 전후의 포맷·픽셀 크기·바이트 크기와 시각 품질을 비교합니다.
- Firebase 업로드 후 정확한 객체의 `Content-Type`, generation, 다운로드 토큰 보존을 확인합니다. 인증 token이나 다운로드 URL의 비밀 query 값은 출력·문서화하지 않습니다.
- 변경한 로컬 경로와 외부 Storage 객체를 나눠 보고합니다. 확인하지 않은 브라우저 동작이나 API 응답은 검증했다고 보고하지 않습니다.
- 최적화본이 깨졌거나 시각 품질이 저하되면 보존한 원본과 이전 metadata를 이용해 복구합니다.
