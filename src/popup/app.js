// TODO: Options: Save New Tabs
// TODO: show all windows in accordion menu in collapsed state, current window expanded
// TODO: show favicon in list

const chromeApi = require('./chromeAPIWrapper');
const templateBuilder = require('./templateBuilder');
const CONSTANTS = require('./constants');

const CLASS_SELECTED = 'selected';
const CLASS_HIDE = 'hide';
const EVENT_CLICK = 'click';

const handleFeatureButtonClick = (buttons, views) => (event) => {
  toggleCssClass(CLASS_SELECTED, buttons);
  toggleCssClass(CLASS_HIDE, views);
};

const toggleCssClass = (cssClass, elements) => {
  elements.forEach(element => element.classList.toggle(cssClass));
};

const saveSubsession = async (event) => {
  event.preventDefault();
  const newSubsessionNameElement = document.getElementById('new-subsession-name');
  let newSubsessionName;

  const currentTabs = await chromeApi.getCurrentWindowTabs();
  //TODO: disable button until something is typed
  //TODO: check input against existing subsession names
  //newSubsessinName is in scope here but none of the other variables are. Why?

  if (newSubsessionNameElement.value.trim().length > 0) {
    newSubsessionName = newSubsessionNameElement.value;
  } else {
    // It's okay to not have a name. Just use a timestamp. But that also means...
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
    return console.info('no tabs selected'); //nothing to do
  }

  const subsessionStorage = await chromeApi.getSubsessionStorage() || {};

  if (Object.keys(subsessionStorage).includes(newSubsessionName)) {
      //TODO: UI Message
      //TODO: Checkbox to overwrite existing?
      //TODO: Checkbox to close tabs on save?
      return console.info('subsession with name provided already exists');
    }

  // are you comfortable with the discrepancy between the default name and the time saved?
  const subsessionToSave = {
      [newSubsessionName]: {
        tabs: tabsToSave,
        date: new Date().toISOString(),
      }
  };

  try {
    await chromeApi.setSubsessionStorage(Object.assign(
      {}, subsessionStorage, {[newSubsessionName]: tabsToSave}));
    console.info('action complete');
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
  const subsessionStorage = await chromeApi.getSubsessionStorage() || {};
  const subsessionNames = Object.keys(subsessionStorage);

  if (subsessionNames.length === 0) {
    const noSubsessionsMessageElement = document.createElement('div');
    noSubsessionsMessageElement.textContent = CONSTANTS.UI_NO_SUBSESSIONS;
    subsessionListElement.appendChild(noSubsessionsMessageElement);
    return console.info(CONSTANTS.UI_NO_SUBSESSIONS);
  }

  subsessionNames.forEach((subsessionName) => {
    //build subsessionListItemElement
    const subsessionElement = document.createElement('div');
    const subsessionRestoreButton = document.createElement('button');
    subsessionRestoreButton.textContent = 'Restore';
    subsessionRestoreButton.addEventListener(EVENT_CLICK, async (event) => {
      const subsession = subsessionStorage[subsessionName];

      // FIXME: After doing Promise.all, refactor call and handle error
      chromeApi.addSubsessionTabsToCurrentWindow(subsession);
      // if (someResult !== null) {
      //   console.info('subsession restored');
      // } else {
      //   console.error(error);
      // }
    });
    subsessionElement.appendChild(subsessionRestoreButton);

//FIXME: HERE
    const subsessionDeleteButton = document.createElement('button');
    subsessionDeleteButton.textContent = 'X';
    subsessionDeleteButton.addEventListener(EVENT_CLICK, (event) => {
      // remove subsession from local object by id
      // persist subsession tabs
      // remove tab from view

    });

    const subsessionSummaryElement = document.createElement('summary');
    subsessionSummaryElement.textContent = subsessionName;
    const subsessionDetailElement = document.createElement('details');
    subsessionDetailElement.appendChild(subsessionSummaryElement);
    subsessionStorage[subsessionName].forEach((subsessionTab) =>
      subsessionDetailElement.appendChild(templateBuilder.buildTabListItemElement(subsessionTab)));
      subsessionElement.appendChild(subsessionDetailElement);
      subsessionListElement.appendChild(subsessionElement);
  });

  // TODO: implement delete subsession functionality
};

module.exports = async () => {
  const tabListElement = document.getElementById('tab-list');
  const selectAllTabsElement = document.getElementById(CONSTANTS.SELECT_ALL_TABS);
  const subsessionListElement = document.getElementById('subsession-list');
  const listButton = document.getElementById('list-subsessions');
  const newSubsessionButton = document.getElementById('new-subsession');
  const newSubsessionView = document.getElementById('tab-list-container');
  const saveSubsessionButton = document.getElementById('save-subsession');
  const listSubsessionsView = document.getElementById('subsession-list');

  const currentWindowTabs = await chromeApi.getCurrentWindowTabs();

  selectAllTabsElement.addEventListener(EVENT_CLICK, selectAllTabs(tabListElement));
  selectAllTabsElement.addEventListener(CONSTANTS.EVENT_EVAL_CHECKBOX_LIST, (event) => {
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
  });

  const listButtonEventHandler = (event) => {
    buildSubsessionList(subsessionListElement);
    handleFeatureButtonClick([listButton, newSubsessionButton],
      [newSubsessionView, listSubsessionsView])(event);
  };

  const newSubsessionButtonEventHandler = (event) => {
    subsessionListElement.innerHTML = '';
    handleFeatureButtonClick([listButton, newSubsessionButton],
      [newSubsessionView, listSubsessionsView])(event);
  };

  const appButtonEventHandler = (event, buttonHandler) => {
    if (event.currentTarget.classList.contains(CLASS_SELECTED)) {
      return;
    }
    buttonHandler(event);
  };

  listButton.addEventListener(EVENT_CLICK, (event) => {
    appButtonEventHandler(event, listButtonEventHandler);
  });

  newSubsessionButton.addEventListener(EVENT_CLICK, (event) => {
    appButtonEventHandler(event, newSubsessionButtonEventHandler);
  });

  saveSubsessionButton.addEventListener(EVENT_CLICK, saveSubsession);

  templateBuilder.buildTabList(currentWindowTabs, tabListElement);
};
