import type {CacheEntry} from "./CacheEntry.ts";
import type {DataFetcher} from "./DataFetcher.ts";

export class DataSource<T> {
  private readonly dataFetcher: DataFetcher<T>;
  private fetching: Promise<CacheEntry<T> | void> | null = null;

  constructor(dataFetcher: DataFetcher<T>) {
    this.dataFetcher = dataFetcher;
  }

  refresh(): Promise<CacheEntry<T> | void> {
    if (!this.isFetching()) {
      this.setFetching();
    }

    return this.getFetching();
  }

  private isFetching() {
    return this.fetching !== null;
  }

  private setFetching() {
    this.fetching = this.dataFetcher.fetch()
      .catch(e => {
        console.error(e);
      }).finally(() => {
        this.fetching = null;
      });
  }

  private getFetching() {
    return this.fetching as Promise<CacheEntry<T> | void>;
  }
}
