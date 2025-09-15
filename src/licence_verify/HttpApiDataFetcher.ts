import {CacheEntry} from "../cache/CacheEntry.ts";
import type {DataFetcher} from "../cache/DataFetcher.ts";
import type {HttpApiCommand} from "./HttpApiComand.ts";



class HttpResponseStatus {
  static readonly OK = 200;
  static readonly FORBIDDEN = 403;
  static readonly INTERNAL_SERVER_ERROR = 500;
}

export class HttpApiDataFetcher implements DataFetcher<string> {
  private static readonly ONE_HOUR_MS = 60 * 60 * 1000;
  private static readonly ONE_DAY_MS = 24 * 60 * 60 * 1000;

  private command: HttpApiCommand;

  constructor(command: HttpApiCommand) {
    this.command = command;
  }

  async fetch(requestAt: number = Date.now()): Promise<void | CacheEntry<string>> {
    let errorMessage = "";
    let maxAgeAt = requestAt;

    const response = await this.command.execute();
    switch (response.status) {
      case HttpResponseStatus.OK:
        maxAgeAt = Date.parse((await response.json()).maxAgeAt)
        break;
      case HttpResponseStatus.FORBIDDEN:
        maxAgeAt = requestAt + HttpApiDataFetcher.ONE_DAY_MS;
        break;
      case HttpResponseStatus.INTERNAL_SERVER_ERROR:
        maxAgeAt = requestAt + HttpApiDataFetcher.ONE_HOUR_MS;
        break;
      default:
        errorMessage = (await response.json()).error.message;
        break;
    }

    return new CacheEntry(errorMessage, maxAgeAt);
  }
}
