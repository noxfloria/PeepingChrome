/**ログのダウンロード */
function downloadLog(){
  // ローカルストレージにからデータを取得
  chrome.storage.local.get(['log'], function(result){
    // データがある場合
    if(result.log){
      let jsonData = JSON.stringify(result.log);
      const logFileName = "log.json";
      // ダウンロード用のリンクを作成する
      const downloadLink = document.createElement("a");
      downloadLink.href = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
      downloadLink.download = logFileName;

      // リンクをクリックする
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // データがない場合
    }else {
      alert("There is no data");
    }
  });
  return 0;
}

// すべてのログをダウンロードボタンのイベント
document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('allLogButton');
  button.addEventListener('click', function() {
    downloadLog();
  });
});

// ログの削除
document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('clearData');
  button.addEventListener('click', function() {
    let temp, temp2;
    chrome.storage.local.get(['exept_url'], function(result) {
      temp = result.exept_url || [];
    });
    chrome.storage.local.get(['post_exept_url'], function(result) {
      temp2 = result.post_exept_url || [];
    });
    chrome.storage.local.clear();
    chrome.storage.local.get(['exept_url'], function (result) {
      const exeptUrl = result.exept_url || [];
      temp.forEach(item => {
        exeptUrl.push(item);
      });
      chrome.storage.local.set({exept_url: exeptUrl});
    });
    chrome.storage.local.get(['post_exept_url'], function (result) {
      const exeptUrl = result.post_exept_url || [];
      temp2.forEach(item => {
        exeptUrl.push(item);
      });
      chrome.storage.local.set({post_exept_url: exeptUrl});
    });
    alert('All Logs have been removed');
  });
});

// 設定画面の表示
document.addEventListener('DOMContentLoaded', function() {
  var link = document.getElementById('option-link');
  link.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
  });
});
