import {CacheEntry} from "./CacheEntry.ts";
import type {CacheDataSource} from "./CacheDataSource.ts";

export class SingleCache<T> {
  private cacheEntry: CacheEntry<T>;
  private dataSource: CacheDataSource<T>;
  private onRefreshed: (cacheEntry: CacheEntry<T>) => Promise<void> = async () => {};

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
    const newCacheEntry = await this.dataSource.refresh();
    if (newCacheEntry) {
      void this.onRefreshed(newCacheEntry);
      this.cacheEntry = newCacheEntry;
    }
  }

  getCacheEntry() {
    return this.cacheEntry;
  }

  setOnRefreshed(onRefreshed: (cacheEntry: CacheEntry<T>) => Promise<void>) {
    this.onRefreshed = onRefreshed;
  }
}