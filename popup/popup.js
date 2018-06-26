let mainButton = document.getElementById('main-button');

mainButton.onclick = function(element) {
  chrome.runtime.sendMessage('mainButton:click');
};
