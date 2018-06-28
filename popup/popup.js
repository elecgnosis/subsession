const getCurrentWindow = () => (new Promise((resolve, reject) => chrome.windows.getCurrent({}, resolve)));

const currentSession = [];

const buildTabListItemElement = (tabData) => {
  const tabListItemCheckbox = document.createElement('input');
  tabListItemCheckbox.type = 'checkbox';
  tabListItemCheckbox.name = tabData.id;
  tabListItemCheckbox.value = tabData.id;
  tabListItemCheckbox.id = tabData.id;
  tabListItemCheckbox.checked = true;

  const tabListItemCheckboxLabel = document.createElement('label');
  tabListItemCheckboxLabel.htmlFor = tabData.id;
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

document.addEventListener('DOMContentLoaded', async () => {
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

  const classSelected = 'selected';
  const classHide = 'hide';

  const swapCssClass = (cssClass, element, otherElement) => {
    element.classList.add(cssClass);
    otherElement.classList.remove(cssClass);
  };

  const selectButton = (button, otherButton) => {
    button.classList.add(classSelected);
    otherButton.classList.remove(classSelected);
  };

  const displayView = (view, otherView) => {
    view.classList.remove(classHide);
    otherView.classList.add(classHide);
  };

  const listButton = document.getElementById('list-subsessions');
  const newSubsessionButton = document.getElementById('new-subsession');
  const newSubsessionView = document.getElementById('tab-list-container');
  const listSubsessionsView = document.getElementById('subsession-list');
  listButton.addEventListener('click', (event) => {
    swapCssClass(classSelected, listButton, newSubsessionButton);
    swapCssClass(classHide, newSubsessionView, listSubsessionsView);
  });
  newSubsessionButton.addEventListener('click', (event) => {
    swapCssClass(classSelected, newSubsessionButton, listButton);
    swapCssClass(classHide, listSubsessionsView, newSubsessionView);
  });

});
