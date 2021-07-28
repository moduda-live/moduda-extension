browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.type == "CONNECTED") {
    browser.runtime.sendMessage({
      type: request.type
    });
  }
});
