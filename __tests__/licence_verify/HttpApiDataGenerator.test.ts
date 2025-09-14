import {describe, it} from "vitest";
import {CacheEntry} from "../../src/cache/CacheEntry.ts";
import {assertEquals, assertFalse, assertTrue,} from "../helper/Assertions.ts";
import {type HttpApiCommand, HttpApiDataGenerator} from "../../src/licence_verify/HttpApiDataGenerator.ts";

describe("HttpApiDataGenerator", () => {
  it("응답 상태가 200 인 경우, response 의 maxAgeAt 을 사용한다", async () => {
    const success: HttpApiCommand = {
      execute: async () => ({
        status: 200,
        json: async () => ({
          maxAgeAt: "2025-09-12T10:53:23.000Z"
        })
      })
    };

    const dataSource = new HttpApiDataGenerator(success);
    const response = await dataSource.generate() as CacheEntry<string>;

    assertEquals("", response.getValue());
    assertFalse(response.isExpired(Date.parse("2025-09-12T10:53:22.999Z")));
    assertFalse(response.isExpired(Date.parse("2025-09-12T10:53:23.000Z")));
    assertTrue(response.isExpired(Date.parse("2025-09-12T10:53:23.001Z")));
  });

  it("응답 상태가 403(유효한 URL 이 아님) 인 경우, maxAgeAt 을 + 1 Day 로 설정한다", async () => {
    const notFoundServer: HttpApiCommand = {
      execute: async () => ({
        status: 403,
        json: async () => ({
          Message: null
        })
      })
    };

    const dataSource = new HttpApiDataGenerator(notFoundServer);

    const requestAt = Date.parse("2025-09-12T10:53:23.000Z");
    const response = await dataSource.generate(requestAt) as CacheEntry<string>;

    assertEquals("", response.getValue());
    assertFalse(response.isExpired(Date.parse("2025-09-13T10:53:22.999Z")));
    assertFalse(response.isExpired(Date.parse("2025-09-13T10:53:23.000Z")));
    assertTrue(response.isExpired(Date.parse("2025-09-13T10:53:23.001Z")));
  });

  it("응답 상태가 500 인 경우, maxAgeAt 을 + 1 Hour 로 설정한다", async () => {
    const serverError: HttpApiCommand = {
      execute: async () => ({
        status: 500,
        json: async () => ({
          Message: null
        })
      })
    };

    const dataSource = new HttpApiDataGenerator(serverError);

    const requestAt = Date.parse("2025-09-12T10:53:23.000Z");
    const response = await dataSource.generate(requestAt) as CacheEntry<string>;

    assertEquals("", response.getValue());
    assertFalse(response.isExpired(Date.parse("2025-09-12T11:53:22.999Z")));
    assertFalse(response.isExpired(Date.parse("2025-09-12T11:53:23.000Z")));
    assertTrue(response.isExpired(Date.parse("2025-09-12T11:53:23.001Z")));
  });

  it("그 외 응답 상태가 400 대인 경우, 에러 메세지를 설정하고 maxAgeAt 을 요청 시간으로 설정한다", async () => {
    const serverError: HttpApiCommand = {
      execute: async () => ({
        status: 401,
        json: async () => ({
          error: {
            code: "401_2",
            message: "이미 사용중인 라이센스 입니다.",
            status: 401,
          },
        })
      })
    };

    const dataSource = new HttpApiDataGenerator(serverError);

    const requestAt = Date.parse("2025-09-12T10:53:23.000Z");
    const response = await dataSource.generate(requestAt) as CacheEntry<string>;

    assertEquals("이미 사용중인 라이센스 입니다.", response.getValue());
    assertFalse(response.isExpired(Date.parse("2025-09-12T10:53:22.999Z")));
    assertFalse(response.isExpired(Date.parse("2025-09-12T10:53:23.000Z")));
    assertTrue(response.isExpired(Date.parse("2025-09-12T10:53:23.001Z")));
  });
});