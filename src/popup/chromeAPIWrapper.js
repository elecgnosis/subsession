const CONSTANTS = require('./constants');

const getSubsessionStorage = () => (new Promise((resolve, reject) =>
    chrome.storage.sync.get([CONSTANTS.APPSTORAGEIDENTIFIER], (storage) =>
      resolve(storage[CONSTANTS.APPSTORAGEIDENTIFIER])))
    );
const getCurrentWindowTabs = () => (new Promise((resolve, reject) =>
    chrome.tabs.query({currentWindow: true}, resolve))
  );
const setSubsessionStorage = (item) => (new Promise((resolve, reject) =>
    chrome.storage.sync.set({[CONSTANTS.APPSTORAGEIDENTIFIER]: item}, resolve))
  );
const addSubsessionTabsToCurrentWindow = (subsessionTabs) => (new Promise((resolve, reject) =>
//FIXME: This needs to be a Promise.all
  subsessionTabs.forEach((subsessionTab) =>
    chrome.tabs.create(
      {
      index: subsessionTab.index,
      url: subsessionTab.url,
      pinned: subsessionTab.pinned,
      // openerTabId: subsessionTab.openerTabId // TODO: set correct openerTabId
    }
  ))));

const createTab = async (subsessionTab) => {
  return new Promise((resolve, reject) => {
      chrome.tabs.create(
        {
          index: subsessionTab.index,
          url: subsessionTab.url,
          pinned: subsessionTab.pinned,
          // openerTabId: subsessionTab.openerTabId // TODO: set correct openerTabId
        }
      );
  });
}

module.exports = {
  getSubsessionStorage,
  getCurrentWindowTabs,
  setSubsessionStorage,
  addSubsessionTabsToCurrentWindow,
};
