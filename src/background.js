/**タイムスタンプを人間が見やすいように整形する */
function getTime(timestamp){
  if(timestamp === undefined){
    timestamp = Date.now();
  };
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedTime
}

function checkExeptUrl(current_url, callback) {
  const defExeptUrl = [
    "adservice.google.com",
  ];
  if (current_url.startsWith("chrome-extension")) {
    callback(false);
  } else if (current_url.startsWith("devtools")) {
    callback(false);
  } else {
    for (let i = 0; i < defExeptUrl.length; i++) {
      if (current_url.includes(defExeptUrl[i])) {
        callback(false);
        return;
      }
    }

    chrome.storage.local.get(['exept_url'], function(result) {
      const exeptUrl = result.exept_url || [];
      for (let i = 0; i < exeptUrl.length; i++) {
        if (current_url.includes(exeptUrl[i])) {
          callback(false);
          return;
        }
      }
      callback(true);
    });
  }
}

function checkExeptPostUrl(current_url, callback) {
  const defExeptUrl = [
    "adservice.google.com",
  ];
  if (current_url.startsWith("chrome-extension")) {
    callback(false);
  } else if (current_url.startsWith("devtools")) {
    callback(false);
  } else {
    for (let i = 0; i < defExeptUrl.length; i++) {
      if (current_url.includes(defExeptUrl[i])) {
        callback(false);
        return;
      }
    }

    chrome.storage.local.get(['post_exept_url'], function(result) {
      const exeptUrl = result.post_exept_url || [];
      for (let i = 0; i < exeptUrl.length; i++) {
        if (current_url.includes(exeptUrl[i])) {
          callback(false);
          return;
        }
      }
      callback(true);
    });
  }
}

/**ウィンドウIDを取得する */
function getCurrentWindow(){
  let windowId;
  chrome.windows.getCurrent( (window) => {
    windowId = str_checkUndefined(window.id);
  });
  return windowId;
}

/**ウィンドウID と タブID を取得する */
function getCurrentTab(){
  let tabId;
  chrome.tabs.getCurrent( (tab) => {
    tabId = str_checkUndefined(tab.id);
  });
  return tabId;
}

/**undefined を-2に変換する */
function num_checkUndefined(value) {
  if (value === undefined) {
    return -2;
  } else {
    return value;
  }
};

/**undefined をnoneに変換する */
function str_checkUndefined(value) {
  if (value === undefined) {
    return "none";
  } else {
    return value;
  }
};

/**base64 エンコードされた文字列に変換する */
function arrayBufferToBase64(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const decoder = new TextDecoder('utf-8');
  const binary = decoder.decode(uint8Array);
  const encoder = new TextEncoder('utf-8');
  const data = encoder.encode(binary);
  const base64Data = btoa(String.fromCharCode(...new Uint8Array(data)));
  return base64Data;
};

/**************************HTTP リクエスト ********************/
const setHTTPLogger = (details) => {
    // サブフレームは，無視する
    if (details.frameType !== "sub_frame" && details.method === "POST" && details.requestBody.error !== "Unknown error.") {
      checkExeptUrl(details.url, function(isValid) {
        if(isValid){
          checkExeptPostUrl(details.url, function(isValid) {
            if(isValid){
              // ローカルストレージに配列を追記する
              chrome.storage.local.get(['log'], function(result){
                let logs = result.log || [];
          
                if (details.requestBody && details.requestBody.raw && details.requestBody.raw[0] && details.requestBody.raw[0].bytes) {
                  details.requestBody = arrayBufferToBase64(details.requestBody.raw[0].bytes);
                } else {
                  details.requestBody = str_checkUndefined(details.requestBody);
                }
          
                logs.push({
                  operation: "HTTP POST Request",
                  details: {
                    documentId: str_checkUndefined(details.documentId),
                    frameId: details.frameId,
                    frameType: str_checkUndefined(details.frameType),
                    method: details.method,
                    url: details.url,
                    requestBody: details.requestBody
                  },
                  time: details.timeStamp,
                  location: {
                    windowId: getCurrentWindow,
                    tabId: details.tabId,
                  }
                });
                chrome.storage.local.set({"log": logs})
              });
            }
          });
        }
      });
    }
  return;
};

function addHTTPRequestLogger(){
  chrome.webRequest.onBeforeRequest.addListener(setHTTPLogger, {urls: ["<all_urls>"]}, ["requestBody"])
}

/**************************ダウンロード ***********************/

/**ダウンロードロガーをセットする */
const setDownloadLogger = (downloadItem) => {
  // ローカルストレージに配列を追記する
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Download",
      details: {
        id: downloadItem.id,
        filename: str_checkUndefined(downloadItem.filename),
        finalUrl: downloadItem.finalUrl,
        url: downloadItem.url,
        state: downloadItem.state,
      },
      time: downloadItem.startTime,
      location: {
        windowId: getCurrentWindow,
        tabId: getCurrentTab
      }
    });
    chrome.storage.local.set({"log": logs});
  });
  return;
};

/**ダウンロードのロガーをセット */
function addDownloadLogger(){
  chrome.downloads.onCreated.addListener(setDownloadLogger);
}

/** ダウンロードのロガーを削除*/
function removeDownloadLogger(){
  chrome.downloads.onCreated.removeListener(setDownloadLogger);
}

/*****************************ページ遷移 ********************/

/**ページ遷移のロガー用コールバック関数 */
const setNavigationLogger = (details) => {
  // オートのサブフレームは，無視する
  if (details.transitionType !== "auto_subframe"){
    checkExeptUrl(details.url, function(isValid) {
      if(isValid){
        // ローカルストレージに配列を追記する
        chrome.storage.local.get(['log'], function(result){
          let logs = result.log || [];
          logs.push({
            operation: "Navigation",
            time: details.timeStamp,
            details: {
              documentId: str_checkUndefined(details.documentId),
              frameId: details.frameId,
              parentFrameId: details.parentFrameId,
              url: details.url,
              transitionType: details.transitionType,
              transitionQualifiers: details.transitionQualifiers
            },
            location: {
              windowId: getCurrentWindow(),
              tabId: details.tabId
            }
          });
          chrome.storage.local.set({"log": logs})
        });
      }
    });
  }
  return;
};

/**ページ遷移のロガーをセット */
function addNavigationLogger(){
  chrome.webNavigation.onCommitted.addListener(setNavigationLogger);
}

/**ページ遷移のロガーを削除 */
function removeNavigationLogger(){
  chrome.webNavigation.onCommitted.removeListener(setNavigationLogger);
}

/**************************タブ関連 ******************************/

/**タブ生成のロガー用コールバック関数 */
const setTabCreateLogger = (tab) => {
    // ローカルストレージに保存
    chrome.storage.local.get(['log'], function(result){
      let logs = result.log || [];
      logs.push({
        operation: "Tab Create",
        details: {
          index: tab.index,
          openerTabId: num_checkUndefined(tab.openerTabId),
          pendingUrl: str_checkUndefined(tab.pendingUrl),
          url: str_checkUndefined(tab.url)
        },
        time: Date.now(),
        location: {
          windowId: tab.windowId,
          tabId: tab.id,
        }
      });
      chrome.storage.local.set({"log": logs})
    });
  return;
}

/**タブ削除のロガー用コールバック関数 */
const setTabRemoveLogger = (tabId, removeInfo) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: " Tab Remove",
      details: {
      },
      time: Date.now(),
      location: {
        windowId: removeInfo.windowId,
        tabId: tabId,
      }
    });
    chrome.storage.local.set({"log": logs})
  });
  return;
}

/**タブのアタッチのロガー用コールバック関数 */
const setTabAttachLogger = (tabId, attachInfo) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Attach",
      details: {
        toIndex: attachInfo.newPosition,
      },
      time: Date.now(),
      location: {
        windowId: attachInfo.newWindowId,
        tabId: tabId,
      }
    });
    chrome.storage.local.set({"log": logs})
  });
  return;
}

/**タブのデタッチのロガー用コールバック関数 */
const setTabDetachLogger = (tabId, detachInfo) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Detach",
      details: {
        fromIndex: detachInfo.oldPosition,
      },
      time: Date.now(),
      location: {
        windowId: detachInfo.oldWindowId,
        tabId: tabId,
      }
    });
    chrome.storage.local.set({"log": logs})
  });
  return;
}

/**タブの移動情報のロガー用コールバック関数 */
const setTabMoveLogger = (tabId, moveInfo) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Move",
      details: {
        fromIndex: moveInfo.fromIndex,
        toIndex: moveInfo.toIndex,
      },
      time: Date.now(),
      location: {
        windowId: moveInfo.windowId,
        tabId: tabId,
      }
    });
    chrome.storage.local.set({"log": logs})
  });
return;
};

/**********************タブグループ *******************/

/**タブグループ生成のロガー用コールバック関数 */
const setTabGroupCreateLogger = (tabGroup) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Group Create",
      details: {
        color: tabGroup.color,
        tabGroupId: tabGroup.id,
      },
      time: Date.now(),
      location: {
        windowId: tabGroup.windowId,
        tabId: getNewTabInGroup(tabGroup.windowId, tabGroup.id)
      }
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**タブグループ削除のロガー用コールバック関数 */
const setTabGroupRemoveLogger = (tabGroup) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Group Remove",
      details: {
        color: tabGroup.color,
        tabGroupId: tabGroup.id,
      },
      time: Date.now(),
      location: {
        windowId: tabGroup.windowId,
      }
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**タブグループ移動のロガー用コールバック関数 */
const setTabGroupMoveLogger = (tabGroup) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Group Move",
      details: {
        color: tabGroup.color,
        tabGroupId: tabGroup.id,
      },
      time: Date.now(),
      location: {
        windowId: tabGroup.windowId,
      }
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**タブグループ削除のロガー用コールバック関数 */
const setTabGroupUpdateLogger = (tabGroup) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.log || [];
    logs.push({
      operation: "Tab Group Update",
      details: {
        color: tabGroup.color,
        tabGroupId: tabGroup.id,
      },
      time: Date.now(),
      location: {
        windowId: tabGroup.windowId,
        tabId: getNewTabInGroup(tabGroup.windowId, tabGroup.id)
      }
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**タブ関連のロガーをセット */
function addTabLogger(){
  chrome.tabs.onCreated.addListener(setTabCreateLogger);
  chrome.tabs.onRemoved.addListener(setTabRemoveLogger);
  chrome.tabs.onAttached.addListener(setTabAttachLogger);
  chrome.tabs.onDetached.addListener(setTabDetachLogger);
  chrome.tabs.onMoved.addListener(setTabMoveLogger);
  chrome.tabGroups.onCreated.addListener(setTabGroupCreateLogger);
  chrome.tabGroups.onRemoved.addListener(setTabGroupRemoveLogger);
  chrome.tabGroups.onMoved.addListener(setTabGroupMoveLogger);
  chrome.tabGroups.onUpdated.addListener(setTabGroupUpdateLogger);
}

/**タブ関連のロガーを削除 */
function removeTabLogger(){
  chrome.tabs.onCreated.removeListener(setTabCreateLogger);
  chrome.tabs.onRemoved.removeListener(setTabRemoveLogger);
  chrome.tabs.onAttached.removeListener(setTabAttachLogger);
  chrome.tabs.onDetached.removeListener(setTabDetachLogger);
  chrome.tabs.onMoved.removeListener(setTabMoveLogger);
  chrome.tabGroups.onCreated.removeListener(setTabGroupCreateLogger);
  chrome.tabGroups.onRemoved.removeListener(setTabGroupRemoveLogger);
  chrome.tabGroups.onMoved.removeListener(setTabGroupMoveLogger);
  chrome.tabGroups.onUpdated.removeListener(setTabGroupUpdateLogger);
}

/****************************** ウィンドウ関連 ****************************/

/**ウィンドウの生成のロガー用コールバック関数 */
const setWidowCreateLogger = (window) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.windowLog || [];
    logs.push({
      operation: "Window Create",
      details: {
      },
      time: Date.now(),
      location: {
        windowId: num_checkUndefined(window.id),
      }
    });
    chrome.storage.local.set({"log": logs})
  });
}

/**ウィンドウ削除のロガー用コールバック関数 */
const setWindowRemoveLogger = (windowId) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.windowLog || [];
    logs.push({
      operation: "Window Remove",
      details: {
      },
      time: Date.now(),
      location: {
        windowId: windowId,
      }
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**ウィンドウ関連のロガーをセット */
function addWindowLogger(){
  chrome.windows.onCreated.addListener(setWidowCreateLogger);
  chrome.windows.onRemoved.addListener(setWindowRemoveLogger);
}

/**ウィンドウ関連のロガーを削除 */
function removeWindowLogger(){
  chrome.windows.onCreated.removeListener(setWidowCreateLogger);
  chrome.windows.onRemoved.removeListener(setWindowRemoveLogger);
}

/*****************************ブックマーク関連 *******************/

/**ブックマーク変更のロガー用のコールバック関数 */
const setBookmarkChangeLogger = (id, changeInfo) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.bookmarkLog || [];
    logs.push({
      operation: "Bookmark Change",
      details: {
        bookmarkId: id,
        title: changeInfo.title,
        url: changeInfo.url
      },
      time: Date.now(),
      location: {}
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**ブックマーク生成のロガー用のコールバック関数 */
const setBookmarkCreateLogger = (id, bookmark) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.bookmarkLog || [];
    logs.push({
      operation: "Bookmark Create",
      details: {
        bookmarkId: id,
        bookmarkTree: bookmark
      },
      time: Date.now(),
      location: {}
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**ブックマーク削除のロガー用のコールバック関数 */
const setBookmarkRemoveLogger = (id, removeInfo) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.bookmarkLog || [];
    logs.push({
      operation: "Bookmark Remove",
      details: {
        bookmarkId: id,
        index: removeInfo.index,
        bookmarkTree: removeInfo.node,
        parentId: removeInfo.parentId
      },
      time: Date.now(),
      location: {}
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**ブックマーク関連のロガーをセット */
function addBookmarkLogger(){
  chrome.bookmarks.onChanged.addListener(setBookmarkChangeLogger);
  chrome.bookmarks.onCreated.addListener(setBookmarkCreateLogger);
  chrome.bookmarks.onRemoved.addListener(setBookmarkRemoveLogger);
}

/**ブックマーク関連のロガーを削除 */
function removeBookmarkLogger(){
  chrome.bookmarks.onChanged.removeListener(setBookmarkChangeLogger);
  chrome.bookmarks.onCreated.removeListener(setBookmarkCreateLogger);
  chrome.bookmarks.onRemoved.removeListener(setBookmarkRemoveLogger);
}

/************************** 拡張機能関連 *****************/

/**拡張機能のインストールのコールバック関数 */
const setExtensionInstallLogger = (info) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.extensionLog || [];
    logs.push({
      operation: "Extension Install",
      details: {
        extensionId: info.id,
        installType: info.installType,
        name: info.name,
        shortName: info.shortName
      },
      time: Date.now(),
      location: {}
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**拡張機能のアンインストールのコールバック関数 */
const setExtensionUninstallLogger = (info) => {
  // ローカルストレージに保存
  chrome.storage.local.get(['log'], function(result){
    let logs = result.extensionLog || [];
    logs.push({
      operation: "Extension Uninstall",
      details: {
        extensionId: info.id,
      },
      time: Date.now(),
      location: {}
    });
    chrome.storage.local.set({"log": logs});
  });
}

/**拡張機能関連のロガーをセット */
function addExtensionLogger(){
  chrome.management.onInstalled.addListener(setExtensionInstallLogger);
  chrome.management.onUninstalled.addListener(setExtensionUninstallLogger);
}

/**拡張機能関連のロガーを削除 */
function removeExtensionLogger(){
  chrome.management.onInstalled.removeListener(setExtensionInstallLogger);
  chrome.management.onUninstalled.removeListener(setExtensionUninstallLogger);
}


addBookmarkLogger();
addDownloadLogger();
addNavigationLogger();
addTabLogger();
addWindowLogger();
addExtensionLogger();
addHTTPRequestLogger();