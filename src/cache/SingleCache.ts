import {CacheEntry} from "./CacheEntry.ts";
import type {DataSource} from "./DataSource.ts";

type OnRefreshCallbackType<T> = (cacheEntry: CacheEntry<T>) => Promise<void>;

export class SingleCache<T> {
  private cacheEntry: CacheEntry<T>;
  private dataSource: DataSource<T>;
  private onRefreshed: OnRefreshCallbackType<T> = async () => {};

  constructor(defaultValue: CacheEntry<T>, dataSource: DataSource<T>) {
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

  setOnRefreshed(onRefreshed: OnRefreshCallbackType<T>) {
    this.onRefreshed = onRefreshed;
  }
}