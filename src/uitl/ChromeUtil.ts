
export default class ChromeUtil {
  static getLocalStorage(key: string) {
    return chrome.storage.local.get(key);
  }

  static setLocalStorage(key: string, value: any) {
    return chrome.storage.local.set({ [key]: value });
  }
}