const getSubsessionStorage = () => (new Promise((resolve, reject) => chrome.storage.local.get(['subsession@subsession.extensions.chrome'], resolve)));
const getCurrentWindowTabs = () => (new Promise((resolve, reject) => chrome.tabs.query({currentWindow: true}, resolve)));

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

document.addEventListener('DOMContentLoaded', async () => {
  const tabListElement = document.getElementById('tab-list');
  const selectAllTabsCheckboxElement = document.getElementById('select-all-tabs');
  const currentWindowTabs = await getCurrentWindowTabs();

  selectAllTabsCheckboxElement.addEventListener('click', (event) => {
    Array.from(tabListElement.children).forEach((child) => {
      child.children[0].checked = event.target.checked;
    });
  });

  currentWindowTabs.forEach((tab) => {
    const tabListItemElement = buildTabListItemElement(tab);
    currentSession.push(tabListItemElement);
    tabListElement.appendChild(tabListItemElement);
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

  const saveSubsessionButton = document.getElementById('save-subsession');
  const newSubsessionName = document.getElementById('new-subsession-name');
  saveSubsessionButton.addEventListener('click', async (event) => {
    //TODO: disable button until something is typed
    //TODO: check input against existing subsession names
    const checkedTabIds = Array.from(document.getElementById('tab-list').children)
      .filter((child) => child.children[0].checked && child.children[0].value !== "false")
      .map((child) => child.children[0].value);
    if (checkedTabIds.length === 0) return; //nothing to do

    // const subsessionStorage = await getSubsessionStorage();
    // subsessionStorage[newSubsessionName] =
  });

});
