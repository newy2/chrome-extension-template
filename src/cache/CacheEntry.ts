
export class CacheEntry<T> {
  private readonly value: T;
  private readonly expiredAt: number;

  constructor(value: T, expiredAt: number) {
    this.value = value;
    this.expiredAt = expiredAt;
  }

  isExpired(requestAt: number) {
    return this.expiredAt < requestAt;
  }

  getValue() {
    return this.value;
  }

  toJson() {
    return {
      value: this.value,
      expiredAt: this.expiredAt
    }
  }
}