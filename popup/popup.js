//TODO: Options: Save New Tabs
//TODO: show all windows in accordion menu in collapsed state, current window expanded
//TODO: show favicon in list

const CLASS_SELECTED = 'selected';
const CLASS_HIDE = 'hide';
const EVENT_CLICK = 'click';
const SUBSESSIONSTORAGEIDENTIFIER = 'subsession@subsession.extensions.chrome';

const getSubsessionStorage = () => (new Promise((resolve, reject) =>
  chrome.storage.local.get([SUBSESSIONSTORAGEIDENTIFIER], (storage) =>
    resolve(storage[SUBSESSIONSTORAGEIDENTIFIER]))));
const getCurrentWindowTabs = () => (new Promise((resolve, reject) =>
  chrome.tabs.query({currentWindow: true}, resolve)));
const setSubsessionStorage = (item) => (new Promise((resolve, reject) =>
  chrome.storage.local.set({[SUBSESSIONSTORAGEIDENTIFIER]: item}, resolve)));

const currentSession = [];

const setElementAttributes = (element, attrs) =>
  Object.keys(attrs).forEach((key) =>
    element.setAttribute(key, attrs[key]));

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
    if (selectAllTabsCheckbox.checked === true
      && selectAllTabsCheckbox.checked !== event.checked) {
        selectAllTabsCheckbox.indeterminate = true;
      }
      //TODO: Fix indeterminate state behavior. Should deselect on all unselected
      //      and select on all selected (manual or auto), indeterminate otherwise.
      //TODO: Handle single tab case
  });

  return tabListItemElement;
};

const buildTabList = (tabs, tabList) =>
  tabs.forEach(tab =>
    currentSession.push(tabList.appendChild(buildTabListItemElement(tab))));

const handleFeatureButtonClick = (buttons, views) => (event) => {
  toggleCssClass(CLASS_SELECTED, ...buttons);
  toggleCssClass(CLASS_HIDE, ...views);
};

const toggleCssClass = (cssClass, element1, element2) => {
  element1.classList.toggle(cssClass);
  element2.classList.toggle(cssClass);
};

const saveSubsession = async (event) => {
  event.preventDefault();
  const newSubsessionName = document.getElementById('new-subsession-name');

  const currentTabs = await getCurrentWindowTabs();
  //TODO: disable button until something is typed
  //TODO: check input against existing subsession names
  //newSubsessinName is in scope here but none of the other variables are. Why?
  if (newSubsessionName.value.trim().length === 0) {
    //TODO: Turn this into user-facing message.
    return console.log('no name provided');
  }

  //TODO: save document.documentElement.scrollTop value to pop back to scroll location on restore
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
    //TODO: Turn this into user-facing message.
    //TODO: Checkbox to overwrite existing?
    //TODO: Checkbox to close tabs on save?
    return console.log('subsession with name provided already exists');
  }

  setSubsessionStorage({[newSubsessionName.value]: tabsToSave});
};

const selectAllTabs = (tabListElement) => (event) => {
  Array.from(tabListElement.children).forEach((child) =>
    child.children[0].checked = event.target.checked);
};

document.addEventListener('DOMContentLoaded', async () => {
  const tabListElement = document.getElementById('tab-list');
  const selectAllTabsElement = document.getElementById('select-all-tabs');
  const listButton = document.getElementById('list-subsessions');
  const newSubsessionButton = document.getElementById('new-subsession');
  const newSubsessionView = document.getElementById('tab-list-container');
  const listSubsessionsView = document.getElementById('subsession-list');
  const saveSubsessionButton = document.getElementById('save-subsession');

  const currentWindowTabs = await getCurrentWindowTabs();

  selectAllTabsElement.addEventListener(EVENT_CLICK, selectAllTabs(tabListElement));

  listButton.addEventListener(EVENT_CLICK,
    handleFeatureButtonClick([listButton, newSubsessionButton],
      [newSubsessionView, listSubsessionsView]));

  newSubsessionButton.addEventListener(EVENT_CLICK,
    handleFeatureButtonClick([listButton, newSubsessionButton],
      [newSubsessionView, listSubsessionsView]));

  saveSubsessionButton.addEventListener(EVENT_CLICK, saveSubsession);

  buildTabList(currentWindowTabs, tabListElement);
});
