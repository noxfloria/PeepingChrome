document.addEventListener('DOMContentLoaded', function () {
  // Load exept_url from local storage and populate the list
  const urlList = document.getElementById('urlList');
  const postUrlList = document.getElementById('postUrlList')

  function updateUrlList() {
    chrome.storage.local.get(['exept_url'], function (result) {
      const exeptUrl = result.exept_url || [];

      // Clear the existing list
      urlList.innerHTML = '';

      if(exeptUrl.length < 1){
        const li = document.createElement('li');
        li.textContent = "There is no excepted URL.";
        li.className = "list-group-item"
        urlList.appendChild(li);
      }

      for (const url of exeptUrl) {
        const li = document.createElement('li');
        li.textContent = url;
        li.className = "list-group-item"
        urlList.appendChild(li);
      }

      // Update the "Remove URL" select options
      const removeUrlSelect = document.getElementById('removeUrl');
      removeUrlSelect.innerHTML = '';
      for (const url of exeptUrl) {
        const option = document.createElement('option');
        option.value = url;
        option.textContent = url;
        removeUrlSelect.appendChild(option);
      }
    });
  }

  // Add URL
  const addUrlButton = document.getElementById('addUrl');
  addUrlButton.addEventListener('click', function () {
    const newUrl = document.getElementById('newUrl').value;
    chrome.storage.local.get(['exept_url'], function (result) {
      const exeptUrl = result.exept_url || [];
      exeptUrl.push(newUrl);
      chrome.storage.local.set({ exept_url: exeptUrl }, function () {
        // Update the list after adding
        updateUrlList();
      });
    });
  });

  // Remove URL
  const removeSelectedUrlButton = document.getElementById('removeSelectedUrl');
  removeSelectedUrlButton.addEventListener('click', function () {
    const selectedUrl = document.getElementById('removeUrl').value;
    chrome.storage.local.get(['exept_url'], function (result) {
      const exeptUrl = result.exept_url || [];
      const index = exeptUrl.indexOf(selectedUrl);
      if (index > -1) {
        exeptUrl.splice(index, 1);
        chrome.storage.local.set({ exept_url: exeptUrl }, function () {
          // Update the list after removing
          updateUrlList();
        });
      }
    });
  });

  function updatePostUrlList() {
    chrome.storage.local.get(['post_exept_url'], function (result) {
      const exeptPostUrl = result.post_exept_url || [];

      // Clear the existing list
      postUrlList.innerHTML = '';

      if(exeptPostUrl.length < 1){
        const li = document.createElement('li');
        li.textContent = "There is no excepted URL.";
        li.className = "list-group-item"
        postUrlList.appendChild(li);
      }

      for (const url of exeptPostUrl) {
        const li = document.createElement('li');
        li.textContent = url;
        li.className = "list-group-item"
        postUrlList.appendChild(li);
      }

      // Update the "Remove URL" select options
      const removePostUrlSelect = document.getElementById('removePostUrl');
      removePostUrlSelect.innerHTML = '';
      for (const url of exeptPostUrl) {
        const option = document.createElement('option');
        option.value = url;
        option.textContent = url;
        removePostUrlSelect.appendChild(option);
      }
    });
  }

  // Add URL
  const addPostUrlButton = document.getElementById('addPostUrl');
  addPostUrlButton.addEventListener('click', function () {
    const newPostUrl = document.getElementById('newPostUrl').value;
    chrome.storage.local.get(['post_exept_url'], function (result) {
      const exeptPostUrl = result.post_exept_url || [];
      exeptPostUrl.push(newPostUrl);
      chrome.storage.local.set({ post_exept_url: exeptPostUrl }, function () {
        // Update the list after adding
        updatePostUrlList();
      });
    });
  });

  // Remove URL
  const removeSelectedPostUrlButton = document.getElementById('removeSelectedPostUrl');
  removeSelectedPostUrlButton.addEventListener('click', function () {
    const selectedPostUrl = document.getElementById('removePostUrl').value;
    chrome.storage.local.get(['post_exept_url'], function (result) {
      const exeptPostUrl = result.post_exept_url || [];
      const index = exeptPostUrl.indexOf(selectedPostUrl);
      if (index > -1) {
        exeptPostUrl.splice(index, 1);
        chrome.storage.local.set({ post_exept_url: exeptPostUrl }, function () {
          // Update the list after removing
          updatePostUrlList();
        });
      }
    });
  });

  // Initial population of the list and select
  updateUrlList();
  updatePostUrlList();
});
