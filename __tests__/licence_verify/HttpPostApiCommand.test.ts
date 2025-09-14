import {describe, it} from "vitest";
import {assertDeepEquals, assertEquals, assertTrue} from "../helper/Assertions.ts";
import {LICENSE_API_KEY, LICENSE_API_URL} from "../../src/config.ts";
import {HttpPostApiCommand} from "../../src/licence_verify/HttpPostApiCommand.ts";


describe("HttpPostApiCommand", () => {
  it("Password 가 일치하는 경우", async () => {
    const command = new HttpPostApiCommand(LICENSE_API_URL + "/verify", {
      licenceKey: LICENSE_API_KEY,
      userAccessKey: "abc"
    });

    const response = await command.execute();
    const responseBody = await response.json();

    assertEquals(200, response.status);
    assertTrue(Date.parse(responseBody.maxAgeAt) > 0);
  });

  it("Password 가 일치하지 않는 경우", async () => {
    const command = new HttpPostApiCommand(LICENSE_API_URL + "/verify", {
      licenceKey: LICENSE_API_KEY,
      userAccessKey: "wrong password"
    });

    const response = await command.execute();
    const responseBody = await response.json();

    assertEquals(401, response.status);
    assertDeepEquals({
      error: {
        code: "401_2",
        message: "이미 사용중인 라이센스 입니다.",
        status: 401,
      },
    }, responseBody);
  });
});