import type {CacheEntry} from "./CacheEntry.ts";

export interface DataFetcher<T> {
  fetch(): Promise<CacheEntry<T> | void>
}
