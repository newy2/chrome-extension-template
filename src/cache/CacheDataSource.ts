import type {CacheEntry} from "./CacheEntry.ts";

export interface DataGenerator<T> {
  generate(): Promise<CacheEntry<T> | void>
}

export class CacheDataSource<T> {
  private readonly dataGenerator: DataGenerator<T>;
  private promise: Promise<CacheEntry<T> | void> | null = null;

  constructor(dataGenerator: DataGenerator<T>) {
    this.dataGenerator = dataGenerator;
  }

  refresh(): Promise<CacheEntry<T> | void> {
    if (!this.isFetching()) {
      this.setFetching();
    }

    return this.getFetching();
  }

  private isFetching() {
    return this.promise;
  }

  private setFetching() {
    this.promise = this.dataGenerator.generate()
      .catch(e => {
        console.error(e);
      }).finally(() => {
        this.promise = null;
      });
  }

  private getFetching() {
    return this.promise as Promise<CacheEntry<T> | void>;
  }
}
