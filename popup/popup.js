const CLASS_SELECTED = 'selected';
const CLASS_HIDE = 'hide';
const SUBSESSIONSTORAGEIDENTIFIER = 'subsession@subsession.extensions.chrome';

const getSubsessionStorage = () => (new Promise((resolve, reject) => chrome.storage.local.get([SUBSESSIONSTORAGEIDENTIFIER], (storage) => resolve(storage[SUBSESSIONSTORAGEIDENTIFIER]))));
const getCurrentWindowTabs = () => (new Promise((resolve, reject) => chrome.tabs.query({currentWindow: true}, resolve)));
const setSubsessionStorage = (item) => (new Promise((resolve, reject) => chrome.storage.local.set({[SUBSESSIONSTORAGEIDENTIFIER]: item}, resolve)));

const currentSession = [];

const setElementAttributes = (element, attrs) => Object.keys(attrs).forEach((key) => element.setAttribute(key, attrs[key]));

const buildTabListItemElement = (tabData) => {
  const tabListItemCheckbox = document.createElement('input');
  setElementAttributes(tabListItemCheckbox, {
    type: 'checkbox',
    name: tabData.id,
    value: tabData.id,
    id: tabData.id,
    checked: true,
  });

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

const buildTabList = (tab) => currentSession.push(document.getElementById('tab-list').appendChild(buildTabListItemElement(tab)));

const swapCssClass = (cssClass, element, otherElement) => {
  element.classList.add(cssClass);
  otherElement.classList.remove(cssClass);
};

document.addEventListener('DOMContentLoaded', async () => {
  const tabListElement = document.getElementById('tab-list');
  const selectAllTabsCheckboxElement = document.getElementById('select-all-tabs');
  const listButton = document.getElementById('list-subsessions');
  const newSubsessionButton = document.getElementById('new-subsession');
  const newSubsessionView = document.getElementById('tab-list-container');
  const listSubsessionsView = document.getElementById('subsession-list');
  const saveSubsessionButton = document.getElementById('save-subsession');
  const newSubsessionName = document.getElementById('new-subsession-name');

  const currentWindowTabs = await getCurrentWindowTabs();

  selectAllTabsCheckboxElement.addEventListener('click', (event) => {
    Array.from(tabListElement.children).forEach((child) => {
      child.children[0].checked = event.target.checked;
    });
  });

  listButton.addEventListener('click', (event) => {
    swapCssClass(CLASS_SELECTED, listButton, newSubsessionButton);
    swapCssClass(CLASS_HIDE, newSubsessionView, listSubsessionsView);
  });

  newSubsessionButton.addEventListener('click', (event) => {
    swapCssClass(CLASS_SELECTED, newSubsessionButton, listButton);
    swapCssClass(CLASS_HIDE, listSubsessionsView, newSubsessionView);
  });

  saveSubsessionButton.addEventListener('click', async (event) => {
    // event.preventDefault();
    const currentTabs = await getCurrentWindowTabs();
    //TODO: disable button until something is typed
    //TODO: check input against existing subsession names
    if (newSubsessionName.value.trim().length === 0) {
      //TODO: Turn this into user-facing message.
      return console.log('no name provided');
    }
    const tabsToSave = currentTabs
      .filter((tab) => Array.from(document.getElementById('tab-list').children)
        .filter((child) => child.children[0].checked && child.children[0].value !== "false")
          .map((child) => child.children[0].value)
            .includes(tab.id.toString()));
    if (tabsToSave.length === 0) {
      //TODO: Turn this into user-facing message.
      return console.log('no tabs selected'); //nothing to do
    }

    const subsessionStorage = await getSubsessionStorage() || {};

    if (Object.keys(subsessionStorage).length > 0 && Object.keys(subsessionStorage).includes(newSubsessionName.value)) {
      //TODO: Turn this into user-facing message. Checkbox to overwrite existing?
      return console.log('subsession with name provided already exists');
    }

    setSubsessionStorage({[newSubsessionName.value]: tabsToSave});
    // setSubsessionStorage({[newSubsessionName.value]: currentTabs.filter((tab) => checkedTabIds.includes(tab.id.toString()))});
    return false;
  });

  currentWindowTabs.forEach(buildTabList); //couldn't pass in tabListElement. What else can I do?
});
