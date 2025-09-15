## 프로젝트 설명
크롬 확장 프로그램에서 사용할 `라이센스 검증 API 호출` 기능을 구현한 템플릿 프로젝트이다.

## 문제해결
### 라이센스 검증 API 캐시

`라이센스 검증 API`는 AWS Lambda Function URL 로 구현됐고, 콜드 스타트로 AWS Lambda 가 실행되는 경우, 응답 시간은 평균 2초 정도 걸린다.  
사용자 경험 향상을 위해 `stale-while-revalidate` 캐시 전략을 참고하여, `라이센스 검증 여부`는 동기 함수로 조회하고, `라이센스 검증 API`는 비동기 함수로 호출하는 기능을 구현한다. 


<img src="docs/SingleCache.png">

### SingleCache
- `라이센스 검증 여부`는 SingleCache 을 사용하여 조회하고 최신화한다.
- `SingleCache#get`는 동기 함수로 `CacheEntry#getValue`를 즉시 반환하고, `CacheEntry`가 만료되면 비동기로 데이터 최신화를 요청한다.

https://github.com/newy2/chrome-extension-template/blob/7c1b0ece8f467eb8078a94fd43e742a4abe70d9f/__tests__/cache/Cache.test.ts#L70-L80

- `SingleCache#get` 는 CacheEntry 가 만료된 경우, `DataSource#refresh`로 `CacheEntry`를 최신화한다.

https://github.com/newy2/chrome-extension-template/blob/7c1b0ece8f467eb8078a94fd43e742a4abe70d9f/src/cache/SingleCache.ts#L24-L30
  
- 서비스 워커는 언제든 비활성화될 수 있기 때문에, `SingleCache`가 메모리에서 해제될 수 있다. `SingleCache#setOnRefreshed`를 사용하여 `CacheEntry`를 Chrome Local Storage 에 저장한다.
 
https://github.com/newy2/chrome-extension-template/blob/7c1b0ece8f467eb8078a94fd43e742a4abe70d9f/src/background.ts#L35-L37

### DataSource
- `DataSource#refresh`는 `CacheEntry` 최신화 작업을 Promise 로 반환하고, Promise 가 소비되기 전까지 같은 Promise 를 반환한다.

https://github.com/newy2/chrome-extension-template/blob/7c1b0ece8f467eb8078a94fd43e742a4abe70d9f/__tests__/cache/Cache.test.ts#L120-L128

- `DataSource#refresh`에서 반환한 Promise 가 소비되면, `DataSource.fetching`를 null 로 초기화한다.

https://github.com/newy2/chrome-extension-template/blob/7c1b0ece8f467eb8078a94fd43e742a4abe70d9f/src/cache/DataSource.ts#L24-L31
