import {LICENSE_API_KEY, LICENSE_API_URL} from "./config.ts";
import {ChromeLocalStorageUtil} from "./uitl/ChromeLocalStorageUtil.ts";
import {DataSource} from "./cache/DataSource.ts";
import {HttpApiDataFetcher} from "./licence_verify/HttpApiDataFetcher.ts";
import {HttpPostApiCommand} from "./licence_verify/HttpPostApiCommand.ts";
import {SingleCache} from "./cache/SingleCache.ts";

chrome.runtime.onInstalled.addListener(() => {
  ChromeLocalStorageUtil.getUserAccessKey().then(userAccessKey => {
    if (!userAccessKey) {
      return ChromeLocalStorageUtil.setUserAccessKey(crypto.randomUUID());
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message === 'licenseInvalidMessage') {
    getLicenseInvalidMessageCache().then(singleCache => {
      sendResponse(singleCache.get());
    });
    return true;//비동기 응답
  }
});

let licenseInvalidMessage: SingleCache<string>;

async function getLicenseInvalidMessageCache() {
  if (!licenseInvalidMessage) {
    const defaultValue = await ChromeLocalStorageUtil.getLicenceCacheEntry();
    const dataSource = new DataSource(new HttpApiDataFetcher(new HttpPostApiCommand(LICENSE_API_URL + "/verify", {
      licenceKey: LICENSE_API_KEY,
      userAccessKey: await ChromeLocalStorageUtil.getUserAccessKey()
    })));
    licenseInvalidMessage = new SingleCache(defaultValue, dataSource);
    licenseInvalidMessage.setOnRefreshed(async (newCacheEntry) => {
      await ChromeLocalStorageUtil.setLicenceCacheEntry(newCacheEntry);
    });
  }

  return licenseInvalidMessage;
}