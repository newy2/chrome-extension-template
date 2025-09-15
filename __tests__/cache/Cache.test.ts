import {beforeEach, describe, it} from "vitest";
import {assertDeepEquals, assertEquals, assertFalse, assertTrue} from "../helper/Assertions.ts";
import {CacheEntry} from "../../src/cache/CacheEntry.ts";
import {SingleCache} from "../../src/cache/SingleCache.ts";
import {DataSource} from "../../src/cache/DataSource.ts";
import type {DataFetcher} from "../../src/cache/DataFetcher.ts";

function waitForMillis(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

class SimpleDataGenerator implements DataFetcher<string> {
  callCount = 0;

  async fetch(): Promise<CacheEntry<string> | void> {
    this.callCount++;
    return new CacheEntry("NEW", Date.parse("2025-09-14"));
  }
}

class ErrorDataGenerator implements DataFetcher<string> {
  callCount = 0;

  async fetch(): Promise<CacheEntry<string> | void> {
    this.callCount++;
    throw new Error("Generate Error!");
  }
}

describe("SingleCache", () => {
  const newDefaultCacheValue = () => {
    const cachedValue = "OLD";
    const expiredAt = Date.parse("2025-09-12");
    return new CacheEntry(cachedValue, expiredAt);
  }

  const newSingleCache = (dataGenerator: DataFetcher<string>) => {
    return new SingleCache(newDefaultCacheValue(), new DataSource(dataGenerator));
  }
  
  describe("DataGenerator 에서 에러가 발생하지 않는 경우", () => {
    let singleCache: SingleCache<string>;
    let dataGenerator: SimpleDataGenerator;

    beforeEach(() => {
      dataGenerator = new SimpleDataGenerator();
      singleCache = newSingleCache(dataGenerator);
    });

    describe("캐시가 만료되지 않은 경우", () => {
      it("DataGenerator#generate 메서드를 호출하지 않는다", () => {
        const requestAt = "2025-09-11";
        const value = singleCache.get(Date.parse(requestAt));
        assertEquals(0, dataGenerator.callCount);
        assertEquals("OLD", value);
      });
    });

    describe("캐시가 만료된 경우", () => {
      const requestAt = "2025-09-13";

      it("DataGenerator#generate 메서드를 호출하고, 과거 데이터('OLD')를 반환한다", () => {
        const staleValue = singleCache.get(Date.parse(requestAt));
        assertEquals(1, dataGenerator.callCount);
        assertEquals("OLD", staleValue);
      });

      it("캐시가 최신화 된 경우, 신규 데이터('NEW')를 반환한다", async () => {
        const staleValue = singleCache.get(Date.parse(requestAt));
        assertEquals(1, dataGenerator.callCount);
        assertEquals("OLD", staleValue);
        
        await waitForMillis(1); // 캐시 최신화 대기

        const newValue = singleCache.get(Date.parse(requestAt));
        assertEquals(1, dataGenerator.callCount, "캐시가 최신화된 경우, DataGenerator#generate 메서드를 호출하지 않는다");
        assertEquals("NEW", newValue);
      });

      it("캐시가 최신화 된 경우, onRefreshed 콜벡이 호출된다", async () => {
        let isRefreshed = false;
        let newCacheEntry: CacheEntry<string>;
        singleCache.setOnRefreshed(async (newValue) => {
          isRefreshed = true;
          newCacheEntry = newValue;
        });

        singleCache.get(Date.parse(requestAt));
        assertFalse(isRefreshed);

        await waitForMillis(1); // 캐시 최신화 대기

        singleCache.get(Date.parse(requestAt));
        assertTrue(isRefreshed);
        assertEquals("NEW", newCacheEntry!.getValue());
      });
    });
  });

  describe("DataGenerator 에서 에러가 발생하는 경우", () => {
    it("DataGenerator#generate 메서드의 에러를 무시하고, 과거 데이터('OLD')를 반환한다", async () => {
      const dataGenerator = new ErrorDataGenerator();
      const errorCache = newSingleCache(dataGenerator);

      assertEquals("OLD", errorCache.get(Date.parse("2025-09-13")));
      assertEquals(1, dataGenerator.callCount, "callCount 는 증가한다");
      
      await waitForMillis(1); // 캐시 최신화 대기

      assertEquals("OLD", errorCache.get(Date.parse("2025-09-13")));
      assertEquals(2, dataGenerator.callCount, "callCount 는 증가한다");
    });
  })
});

describe("CacheDataSource", () => {
  describe("Cache 데이터 생성하기", () => {
    it("Promise 를 소비하지 않은 경우, 같은 Promise 를 반환한다.", async () => {
      const dataSource = new DataSource(new SimpleDataGenerator());
      const value1 = dataSource.refresh();
      const value2 = dataSource.refresh();

      assertTrue(value1 == value2, "Promise 참조 값이 같다");
      assertEquals("NEW", (await value1 as CacheEntry<string>).getValue());
      assertEquals("NEW", (await value2 as CacheEntry<string>).getValue());
    });

    it("Promise 를 소비한 경우, 새로운 Promise 를 반환한다.", async () => {
      const dataSource = new DataSource(new SimpleDataGenerator());
      const value1 = dataSource.refresh();
      await value1; // Promise 를 소비한다.
      const value2 = dataSource.refresh();

      assertTrue(value1 != value2, "Promise 참조 값이 다르다");
      assertEquals("NEW", (await value1 as CacheEntry<string>).getValue());
      assertEquals("NEW", (await value2 as CacheEntry<string>).getValue());
    });
  });

  describe("Cache 데이터 생성중 에러가 발생한 경우", () => {
    it("에러가 발생한 경우, falsy 값을 반환한다.", async () => {
      const errorDataSource = new DataSource(new ErrorDataGenerator());
      assertFalse(await errorDataSource.refresh());
    });
  });
});

describe("CacheEntry", () => {
  let entry: CacheEntry<string>;

  beforeEach(() => {
    const value = "OLD";
    const maxAge = "2025-09-12T10:53:23.000Z";
    entry = new CacheEntry(value, Date.parse(maxAge));
  });

  it("유효기간 검증하기", () => {
    assertFalse(entry.isExpired(Date.parse("2025-09-12T10:53:22.999Z")));
    assertFalse(entry.isExpired(Date.parse("2025-09-12T10:53:23.000Z")));
    assertTrue(entry.isExpired(Date.parse("2025-09-12T10:53:23.001Z")));
  });

  it("값 조회하기", () => {
    assertEquals("OLD", entry.getValue());
  });

  it("LocalStorage 저장용 JSON 반환하기", () => {
    assertDeepEquals({value: "OLD", expiredAt: Date.parse("2025-09-12T10:53:23.000Z")}, entry.toJson());
  });
});
