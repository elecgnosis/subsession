// let mainButton = document.getElementById('main-button');

// mainButton.onclick = function(element) {
//   chrome.runtime.sendMessage('mainButton:click');
// };
//
const getCurrentWindow = () => {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent({}, (window) => {
      resolve(window);
    });
  });
};

const currentSession = [];

const buildTabListItemElement = (tabData) => {
  const uniqueTabIdentifier = 'tab-' + tabData.id;

  const tabListItemCheckbox = document.createElement('input');
  tabListItemCheckbox.type = 'checkbox';
  tabListItemCheckbox.name = uniqueTabIdentifier;
  tabListItemCheckbox.value = uniqueTabIdentifier;
  tabListItemCheckbox.id = uniqueTabIdentifier;
  tabListItemCheckbox.checked = true;

  const tabListItemCheckboxLabel = document.createElement('label');
  tabListItemCheckboxLabel.htmlFor = uniqueTabIdentifier;
  tabListItemCheckboxLabel.textContent = tabData.title;

  const tabListItemElement = document.createElement('li');
  tabListItemElement.setAttribute('title', tabData.title);
  tabListItemElement.appendChild(tabListItemCheckbox);
  tabListItemElement.appendChild(tabListItemCheckboxLabel);

  tabListItemElement.addEventListener('change', (event) => {
    const selectAllTabsCheckbox = document.getElementById('select-all-tabs');
    if (selectAllTabsCheckbox.checked === true && selectAllTabsCheckbox.checked !== event.checked) selectAllTabsCheckbox.indeterminate = true;
  });

  return tabListItemElement;
};

const buildTabListHeaderElement = () => {
  const selectAllTabsCheckboxElementId = 'select-all-tabs';
  const selectAllTabsCheckbox = document.createElement('input');
  selectAllTabsCheckbox.type = 'checkbox';
  selectAllTabsCheckbox.checked = true;
  selectAllTabsCheckbox.id = selectAllTabsCheckboxElementId;

  const selectAllTabsLabel = document.createElement('label');
  selectAllTabsLabel.htmlFor = selectAllTabsCheckboxElementId;
  selectAllTabsLabel.textContent = 'Select All';

  const tabListHeaderElement = document.createElement('li');
  tabListHeaderElement.appendChild(selectAllTabsCheckbox);
  tabListHeaderElement.appendChild(selectAllTabsLabel);
  selectAllTabsCheckbox.addEventListener('click', (event) => {
    const tabListItems = document.getElementById('tab-list').children;
    for (let i = 1; i < tabListItems.length; i += 1) {
      tabListItems[i].children[0].checked = event.target.checked;
    }
  });

  return tabListHeaderElement
};

document.addEventListener("DOMContentLoaded", async () => {
  const tabListElement = document.getElementById('tab-list');
  const currentWindow = await getCurrentWindow();
  chrome.tabs.query({windowId: currentWindow.id}, (tabs) => {
    tabListElement.appendChild(buildTabListHeaderElement());
    tabs.forEach((tab) => {
      const tabListItemElement = buildTabListItemElement(tab);
      currentSession.push(tabListItemElement);
      tabListElement.appendChild(tabListItemElement)
    });
  });
});
