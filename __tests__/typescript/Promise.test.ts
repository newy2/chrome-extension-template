import {describe, it} from "vitest";
import {assertEquals, assertTrue} from "../helper/Assertions.ts";

describe("Promise 재사용 테스트", () => {
  class PromiseGenerator {
    promise: Promise<string> | null = null;
    callCount = 0;

    getPromise(): Promise<string> {
      if (!this.promise) {
        this.promise = new Promise<string>(resolve => {
          this.callCount++;
          setTimeout(() => resolve("abc"), 0);
        }).finally(() => {
          this.promise = null;
        });
      }

      return this.promise;
    }
  }

  it("Promise 를 소비하지 않은 경우, 같은 Promise 를 반환한다.", async () => {
    const generator = new PromiseGenerator();
    const value1 = generator.getPromise();
    const value2 = generator.getPromise();

    assertTrue(value1 == value2, "참조 값이 같다");
    assertEquals("abc", await value1);
    assertEquals("abc", await value2);
    assertEquals(1, generator.callCount);
  });
  it("Promise 를 소비한 경우, 새로운 Promise 를 반환한다.", async () => {
    const generator = new PromiseGenerator();
    const value1 = generator.getPromise();
    assertEquals("abc", await value1, "Promise 를 소비한다");
    const value2 = generator.getPromise();

    assertTrue(value1 != value2, "참조 값이 다르다");
    assertEquals("abc", await value2);
    assertEquals(2, generator.callCount);
  });

  it("Promise 가 소비되면 PromiseGenerator.promise 를 null 로 초기화 한다.", async () =>{
    const generator = new PromiseGenerator();
    const value1 = generator.getPromise();

    assertTrue(generator.promise != null, "Promise 를 소비하기 전");
    assertEquals("abc", await value1, "Promise 를 소비한다");
    assertTrue(generator.promise == null, "Promise 를 소비한 후");
  });
});