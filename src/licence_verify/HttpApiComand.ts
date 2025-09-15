
export type HttpApiResponseType = {
  status: number;
  json(): Promise<any>;
}

export interface HttpApiCommand {
  execute(): Promise<HttpApiResponseType>;
}
