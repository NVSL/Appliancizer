"use strict";

$(function() {

  console.log("Script Running");

  function sendMessage(data) {
    window.parent.postMessage(JSON.stringify(data), "*");
  }

  var isInIframe = !(top === self);
  var responseSent = false;
  var isStarted = false;


  // Loads the whole HTML with any new content
  function loadDialog(data) {
    if (isStarted)
      return;
    isStarted = true;

    //$(document.body).show();

    //var dialog = createDialog(data, sendMessage);
    var originalHTLM = "lal";//dialog.getHTML(); // Original HTML to change

    // Update Button
    $("#ok").click(function() {
      console.log("Update");
      if (!responseSent) {
        responseSent = true;
        sendMessage({
          msg: 'ok',
          finished: true,
          endHTML: originalHTLM
        });
      }
    });

    // Cancel Update
    $("#nevermind").click(function() {
      console.log("Cancel update");
      if (!responseSent) {
        sendMessage({
          msg: 'ok',
          finished: true,
          canceled: true,
          endHTML: originalHTLM
        });
        responseSent = true;
      }
    });
  }

  if (isInIframe) {
    window.addEventListener("message", function(event) {
      console.log("MessageReceivedInRemix");
      console.log(event.data);
      // Gets the message the whole html.
      if (event.data && event.data.length && event.data[0] == '{') {
        loadDialog(JSON.parse(event.data));

      }
    }, false);
  }

});
