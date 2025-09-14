import {CacheEntry} from "./CacheEntry.ts";
import type {CacheDataSource} from "./CacheDataSource.ts";

export class SingleCache<T> {
  private cacheEntry: CacheEntry<T>;
  private dataSource: CacheDataSource<T>;

  constructor(defaultValue: CacheEntry<T>, dataSource: CacheDataSource<T>) {
    this.cacheEntry = defaultValue;
    this.dataSource = dataSource;
  }

  get(now: number = Date.now()): T {
    if (this.cacheEntry.isExpired(now)) {
      void this.onMiss();
    }

    return this.cacheEntry.getValue();
  }

  private async onMiss() {
    this.cacheEntry = await this.dataSource.refresh() || this.cacheEntry;
  }

  getCacheEntry() {
    return this.cacheEntry;
  }
}