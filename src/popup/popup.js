//TODO: Options: Save New Tabs
//TODO: show all windows in accordion menu in collapsed state, current window expanded
//TODO: show favicon in list

const requireTest = require('./requiretest');
requireTest();

const SELECT_ALL_TABS = 'select-all-tabs';
const CLASS_SELECTED = 'selected';
const CLASS_HIDE = 'hide';
const EVENT_CLICK = 'click';
const EVENT_EVAL_CHECKBOX_LIST = 'eval-checkbox-list';
const SUBSESSIONSTORAGEIDENTIFIER = 'subsession@subsession.extensions.chrome';
const UI_NO_SUBSESSIONS = 'No subsessions found.';
const evalCheckboxListEvent = new Event(EVENT_EVAL_CHECKBOX_LIST);

const getSubsessionStorage = () => (new Promise((resolve, reject) =>
  chrome.storage.local.get([SUBSESSIONSTORAGEIDENTIFIER], (storage) =>
    resolve(storage[SUBSESSIONSTORAGEIDENTIFIER]))));
const getCurrentWindowTabs = () => (new Promise((resolve, reject) =>
  chrome.tabs.query({currentWindow: true}, resolve)));
const setSubsessionStorage = (item) => (new Promise((resolve, reject) =>
  chrome.storage.local.set({[SUBSESSIONSTORAGEIDENTIFIER]: item}, resolve)));

const currentSessionTabs = [];

const setElementAttributes = (element, attrs) => {
  Object.keys(attrs).forEach((key) =>
    element.setAttribute(key, attrs[key]));
  return element;
}

const buildTabListItemCheckbox = (tabData) =>
  setElementAttributes(document.createElement('input'), {
    type: 'checkbox',
    name: tabData.id,
    value: tabData.id,
    id: tabData.id,
    checked: true,
  });

const buildTabListItemElement = (tabData) => {
  const tabListItemCheckboxLabel = document.createElement('label');
  tabListItemCheckboxLabel.htmlFor = tabData.id;
  tabListItemCheckboxLabel.textContent = tabData.title;

  const tabListItemElement = document.createElement('li');
  tabListItemElement.setAttribute('title', tabData.title);
  tabListItemElement.appendChild(buildTabListItemCheckbox(tabData));
  tabListItemElement.appendChild(tabListItemCheckboxLabel);

  tabListItemElement.addEventListener('change', (event) => {
    document.getElementById(SELECT_ALL_TABS).dispatchEvent(evalCheckboxListEvent);
  });

  return tabListItemElement;
};

const buildTabList = (tabs, tabList) => {
  if (tabs.length === 1) tabList.children[0].setAttribute('hidden', true);
  tabs.forEach(tab =>
    currentSessionTabs.push(tabList.appendChild(buildTabListItemElement(tab))));
  };

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
  const newSubsessionNameElement = document.getElementById('new-subsession-name');
  let newSubsessionName;

  const currentTabs = await getCurrentWindowTabs();
  //TODO: disable button until something is typed
  //TODO: check input against existing subsession names
  //newSubsessinName is in scope here but none of the other variables are. Why?

  if (newSubsessionNameElement.value.trim().length > 0) {
    newSubsessionName = newSubsessionNameElement.value;
  } else {
    // I`t's okay to not have a name. Just use a timestamp. But that also means...
    //TODO: Save date with subsession.
    newSubsessionName = new Date().toISOString();
  }

  //TODO: save document.documentElement.scrollTop value to pop back to scroll location on restore
  const tabsToSave = currentTabs
    .filter((tab) => Array.from(document.getElementById('tab-list').children)
      .filter((child) => child.children[0].checked && child.children[0].value !== "false")
        .map((child) => child.children[0].value)
          .includes(tab.id.toString()));
  if (tabsToSave.length === 0) {
    //TODO: UI Message
    return console.log('no tabs selected'); //nothing to do
  }

  const subsessionStorage = await getSubsessionStorage() || {};

  if (Object.keys(subsessionStorage).includes(newSubsessionName)) {
      //TODO: UI Message
      //TODO: Checkbox to overwrite existing?
      //TODO: Checkbox to close tabs on save?
      return console.log('subsession with name provided already exists');
    }

  // are you comfortable with the discrepancy between the default name and the time saved?
  const subsessionToSave = {
      [newSubsessionName]: {
        tabs: tabsToSave,
        date: new Date().toISOString(),
      }
  };

  try {
    await setSubsessionStorage(Object.assign(
      {}, subsessionStorage, {[newSubsessionName]: tabsToSave}));
    console.log('action complete');
    //TODO: UI Message
    newSubsessionNameElement.value = '';
  } catch (error) {
    // TODO: UI action failed
    console.error(error);
  }
};

const selectAllTabs = (tabListElement) => (event) => {
  Array.from(tabListElement.children).forEach((child) =>
    child.children[0].checked = event.target.checked);
};

const buildSubsessionList = async (subsessionListElement) => {
  const subsessionStorage = await getSubsessionStorage() || {};
  const subsessionNames = Object.keys(subsessionStorage);

  if (subsessionNames.length === 0) {
    //TODO: turn this into user-facing message.
    const noSubsessionsMessageElement = document.createElement('div');
    noSubsessionsMessageElement.textContent = UI_NO_SUBSESSIONS;
    subsessionListElement.appendChild(noSubsessionsMessageElement);
    return console.log('no subsessions saved.');
  }

  subsessionNames.forEach((subsessionName) => {
    //build subsessionListItemElement
    const subsessionElement = document.createElement('div');
    const subsessionRestoreButton = document.createElement('button');
    subsessionRestoreButton.textContent = 'Restore';
    subsessionElement.appendChild(subsessionRestoreButton);

    const subsessionSummaryElement = document.createElement('summary');
    subsessionSummaryElement.textContent = subsessionName;
    const subsessionDetailElement = document.createElement('details');
    subsessionDetailElement.appendChild(subsessionSummaryElement);
    subsessionStorage[subsessionName].forEach((subsessionTab) =>
      subsessionDetailElement.appendChild(buildTabListItemElement(subsessionTab)));
      subsessionElement.appendChild(subsessionDetailElement);
      subsessionListElement.appendChild(subsessionElement);
  });
};

const app = async () => {
  const tabListElement = document.getElementById('tab-list');
  const selectAllTabsElement = document.getElementById(SELECT_ALL_TABS);
  const subsessionListElement = document.getElementById('subsession-list');
  const listButton = document.getElementById('list-subsessions');
  const newSubsessionButton = document.getElementById('new-subsession');
  const newSubsessionView = document.getElementById('tab-list-container');
  const saveSubsessionButton = document.getElementById('save-subsession');
  const listSubsessionsView = document.getElementById('subsession-list');

  const currentWindowTabs = await getCurrentWindowTabs();

  selectAllTabsElement.addEventListener(EVENT_CLICK, selectAllTabs(tabListElement));
  selectAllTabsElement.addEventListener(EVENT_EVAL_CHECKBOX_LIST, (event) => {
    const checkboxValues = Array.from(tabListElement.children).map((child) =>
      child.children[0].checked);
    checkboxValues.shift();

    if (checkboxValues.length === 0) {
      // no tabs
      selectAllTabsElement.indeterminate = false;
      selectAllTabsElement.checked = false;
      return;
    }
    if (checkboxValues.every(value => value === true)) {
      // all tabs checked
      selectAllTabsElement.indeterminate = false;
      selectAllTabsElement.checked = true;
      return;
    }
    if (checkboxValues.every(value => value === false)) {
      // no tabs checked
      selectAllTabsElement.indeterminate = false;
      selectAllTabsElement.checked = false;
      return;
    }
    // some tabs checked
    selectAllTabsElement.indeterminate = true;

    //DONE: Fix indeterminate state behavior. Should deselect on all unselected
    //      and select on all selected (manual or auto), indeterminate otherwise.
    //DONE: Handle single tab case
  });

  listButton.addEventListener(EVENT_CLICK, (event) => {
    if (event.currentTarget.classList.contains(CLASS_SELECTED)) {
      return;
    }
    buildSubsessionList(subsessionListElement);
    handleFeatureButtonClick([listButton, newSubsessionButton],
      [newSubsessionView, listSubsessionsView])(event);
  });

  newSubsessionButton.addEventListener(EVENT_CLICK, (event) => {
    if (event.currentTarget.classList.contains(CLASS_SELECTED)) {
      return;
    }
    subsessionListElement.innerHTML = '';
    handleFeatureButtonClick([listButton, newSubsessionButton],
      [newSubsessionView, listSubsessionsView])(event);
    });

  saveSubsessionButton.addEventListener(EVENT_CLICK, saveSubsession);

  buildTabList(currentWindowTabs, tabListElement);
};

document.addEventListener('DOMContentLoaded', () => app().catch(console.error));