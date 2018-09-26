const CONSTANTS = require('./constants');

const getSubsessionStorage = () => (new Promise((resolve, reject) =>
    chrome.storage.local.get([CONSTANTS.SUBSESSIONSTORAGEIDENTIFIER], (storage) =>
      resolve(storage[CONSTANTS.SUBSESSIONSTORAGEIDENTIFIER])))
    );
const getCurrentWindowTabs = () => (new Promise((resolve, reject) =>
    chrome.tabs.query({currentWindow: true}, resolve))
  );
const setSubsessionStorage = (item) => (new Promise((resolve, reject) =>
    chrome.storage.local.set({[CONSTANTS.SUBSESSIONSTORAGEIDENTIFIER]: item}, resolve))
  );
const addSubsessionTabsToCurrentWindow = (subsessionTabs) => (new Promise((resolve, reject) =>
  subsessionTabs.forEach((subsessionTab) =>
    chrome.tabs.create({
      index: subsessionTab.index,
      url: subsessionTab.url,
      pinned: subsessionTab.pinned,
      // openerTabId: subsessionTab.openerTabId // TODO: set correct openerTabId
    }, console.info('subsession restored')))));
module.exports = {
  getSubsessionStorage,
  getCurrentWindowTabs,
  setSubsessionStorage,
  addSubsessionTabsToCurrentWindow,
};
