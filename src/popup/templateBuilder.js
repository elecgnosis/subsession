const CONSTANTS = require('./constants');
const EVENT_EVAL_CHECKBOX_LIST = 'eval-checkbox-list';
const currentSessionTabs = [];
const evalCheckboxListEvent = new Event(CONSTANTS.EVENT_EVAL_CHECKBOX_LIST);

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
    document.getElementById(CONSTANTS.SELECT_ALL_TABS).dispatchEvent(evalCheckboxListEvent);
  });

  return tabListItemElement;
};

const buildTabList = (tabs, tabList) => {
  if (tabs.length === 1) tabList.children[0].setAttribute('hidden', true);
  tabs.forEach(tab =>
    currentSessionTabs.push(tabList.appendChild(buildTabListItemElement(tab))));
  };

module.exports = {
  setElementAttributes,
  buildTabListItemCheckbox,
  buildTabListItemElement,
  buildTabList,
};
