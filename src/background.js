// chrome.runtime.onInstalled.addListener(function() {
//   chrome.storage.sync.set({color: '#3aa757'});
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     chrome.declarativeContent.onPageChanged.addRules([{
//       conditions: [new chrome.declarativeContent.PageStateMatcher({
//         pageUrl: {hostEquals: 'developer.chrome.com'},
//       })],
//         actions: [new chrome.declarativeContent.ShowPageAction()]
//     }]);
//   });
// });


// const getSubsessionStorage = () => (new Promise((resolve, reject) => chrome.storage.local.get(['subsession@subsession.extensions.chrome'], resolve)));
//
// chrome.runtime.onInstalled.addListener(async () => {
//   const subsessionStorage = await getSubsessionStorage();
// });

chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
});
