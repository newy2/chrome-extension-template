import type {HttpApiCommand, HttpApiResponseType} from "./HttpApiDataGenerator.ts";

export class HttpPostApiCommand implements HttpApiCommand {
  private readonly url: string;
  private readonly body: any;

  constructor(url: string, body: any) {
    this.url = url;
    this.body = body;
  }

  execute(): Promise<HttpApiResponseType> {
    return fetch(this.url, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.body),
    });
  }
}
