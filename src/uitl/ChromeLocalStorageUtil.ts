import {CacheEntry} from "../cache/CacheEntry.ts";

export class ChromeLocalStorageUtil {
  private static async getLocalStorage(key: string) {
    const object = await chrome.storage.local.get(key);
    return object[key];
  }

  private static setLocalStorage(key: string, value: any) {
    return chrome.storage.local.set({ [key]: value });
  }

  static getUserAccessKey(): Promise<string> {
    return this.getLocalStorage("userAccessKey");
  }

  static setUserAccessKey(userAccessKey: string) {
    return this.setLocalStorage("userAccessKey", userAccessKey);
  }

  static async getLicenceCacheEntry(): Promise<CacheEntry<string>> {
    const json = await this.getLocalStorage('licenceCacheEntry') || {};
    const value = json.value || "";
    const expiredAt = json.expiredAt || Date.now();
    return new CacheEntry(value, expiredAt);
  }

  static async setLicenceCacheEntry(cacheEntry: CacheEntry<string>) {
    const json = cacheEntry.toJson();
    await this.setLocalStorage('licenceCacheEntry', json);
  }
}