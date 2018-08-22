"use strict";

// TODO: add infinite undo/redo.
// TODO: make it possible to create/delete attributes.

function startContinuousDynamicScale(selected, parentIframe, maxWidthElem) {
  function setZoom(zoom) {
    parentIframe.contents().find("html").css({
      '-webkit-transform': 'scale(' + zoom + ')',
      '-webkit-transform-origin': 'top left',
      '-moz-transform': 'scale(' + zoom + ')',
      '-moz-transform-origin': 'top left'
    });
  }

  function scaleAndPan(isInstant) {
    var contentWidth = selected.outerWidth(true);
    var frameWidth = parentIframe.width();
    var maxWidth = maxWidthElem.width();
    if (frameWidth > maxWidth) {
      // This is a fix for the iPad.
      parentIframe.width(maxWidth);
      frameWidth = maxWidth;
    }
    var zoom = 1.0;
    if (contentWidth > frameWidth) {
      zoom = frameWidth / contentWidth;
    }
    setZoom(1.0);
    var originalOffset = selected.offset();
    setZoom(zoom);
    var offset = selected.offset();

    // Firefox doesn't apply transformations to
    // offset coordinates, so we'll need to do it
    // manually.
    if (zoom != 1.0 && offset.top == originalOffset.top) {
      offset.top *= zoom;
      offset.left *= zoom;
    }

    var options = {};

    if (!isInstant)
      options.duration = 1000;

    parentIframe.height(selected.outerHeight(true));
    parentIframe.scrollTo({
      top: offset.top,
      left: offset.left
    }, options);
  }

  try {
    scaleAndPan(true);
  } catch (e) {
    if (window.console && window.console.error)
      window.console.error(e);
  }

  return setInterval(scaleAndPan, 500);
}

jQuery.fn.extend({
  hideEverythingExcept: function(selected) {
    var stayVisible = selected.find("*");
    stayVisible = stayVisible.add(selected.parents()).add(selected);
    this.find("*").not(stayVisible).hide();
  }
});

function addDocumentation(rendered) {
  var BASE_MDN_HTML_URL = "https://developer.mozilla.org/en/HTML/";
  var BASE_MDN_HTML_ELEM_URL = BASE_MDN_HTML_URL + "Element/";

  function getElementDocs() {
    var elementName = $(this).text();

    if (elementName.match(/^h[1-6]$/))
      elementName = "h1";

    return elementName;

  }

  function getAttrInfo(element) {
    var attr = {
      name: $(element).text(),
      elementName: $(element).closest(".start").children(".name").text(),
      docs: "",
      mdnLink: ""
    };
    var globalAttrKeyName = "html-attribute-docs:" + attr.name;
    var elementSpecificKeyName = attr.elementName + "." + attr.name;

    if (elementSpecificKeyName) {
      attr.docs = elementSpecificKeyName;
      attr.mdnLink = BASE_MDN_HTML_ELEM_URL + attr.elementName + "#attr-" +
                     attr.name;
    } else if (globalAttrKeyName) {
      attr.docs = globalAttrKeyName;
      attr.mdnLink = BASE_MDN_HTML_URL + "Global_attributes#attr-" +
                     attr.name;
    }
    return attr;
  }

  // Ugh, our CSS styling makes space before and the '=' after
  // an attribute acquire the same hover style as the attribute
  // name itself, which looks nasty, so we'll wrap the attribute
  // name's text in an additional span and put our hover/click
  // styling/handlers on that.
  // TODO: Make it an anchor tag, not a span!
  rendered.find("ul.attributes > li > .name").each(function() {
    var name = $(this).text();
    var wrappedName = $("<span></span>").text(name);
    $(this).empty().append(wrappedName);
  });

  rendered.find("ul.attributes > li > .name span").tipsy({
    html: false,
    gravity: 'nw',
    title: function() {
      return getAttrInfo(this).docs;
    }
  }).click(function() {
    var url = getAttrInfo(this).mdnLink;
    if (url)
      window.open(url, "info");
  }).addClass("mdn-link");

  rendered.find(".start > .name").tipsy({
    html: true,
    gravity: 'w',
    title: getElementDocs
  });

  rendered.find(".end > .name").tipsy({
    html: true,
    gravity: 'e',
    title: getElementDocs
  });

  // TODO: These should really be anchor tags, not click handlers.
  rendered.find(".start > .name, .end > .name").click(function() {
    window.open(BASE_MDN_HTML_ELEM_URL + $(this).text(), "info");
  }).addClass("mdn-link");
}

function makeEditableDom(selected, parent) {
  var rendered = selected.renderDom();

  rendered = rendered.wrap('<div></div>').parent();
  parent.append(rendered);

  var editables = rendered.find(".text, .attributes .value");
  editables.makeTextEditable();
  addDocumentation(rendered);
}

function makeHtmlEditor(container, selected) {
  var widget = $('<div id="html-editor-container">' +
                 '<pre id="html-editor"></pre></div>');
  container.empty().append(widget);
  var html = selected.outerHtml();

  // A simple way to check for HTML strings or ID strings
  // (both of which we optimize for)
  var quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/;

  jQuery.HtmlEditor("html-editor", html, function(html) {
    var match = quickExpr.exec( html );

    // Verify a match
    if ( match && (match[1]) ) {
      var replacement = $(html).first();
      selected.replaceWith(replacement);
      selected = replacement;
      selected.trigger("selection-changed");
    }
  });
}

jQuery.extend({
  loadStylesheets: function(stylesheets) {
    stylesheets.forEach(function(url) {
      var linkTag = $('<link rel="stylesheet">');
      linkTag.attr('href', url);
      $(document.head).append(linkTag);
    });
  },
  loadScripts: function(scripts) {
    scripts = scripts.slice().reverse();

    function loadNextScript() {
      if (scripts.length == 0)
        return;
      var scriptTag = document.createElement('script');
      scriptTag.setAttribute('src', scripts.pop());
      scriptTag.onload = loadNextScript;
      document.body.appendChild(scriptTag);
    }

    loadNextScript();
  }
});

function createDialog(data, sendMessage) {
  var previewDoc = $("#preview").contents();

  previewDoc[0].open();
  previewDoc[0].write(data.startHTML.html);
  previewDoc[0].close();

  // Use the webxray-hidden class to find our focused element
  var selected = previewDoc.find(data.startHTML.selector);
  selected.reallyRemoveClass("webxray-uprootable-element");

  var thisDialog =  {
    getHTML: function getHTML() {
      return selected.outerHtml();
    }
  };

  previewDoc.bind('selection-changed', function(event) {
    console.log("Selection-changed");
    console.log(event.target);
    selected = $(event.target);
    sendMessage({
      msg: 'ok',
      finished: false,
      endHTML: thisDialog.getHTML()
    });
  });

  $(".dialog .tab").click(function() {
    var view = $(this).attr("id");

    $(".dialog .tab").removeClass("selected");
    $(this).addClass("selected");
    switch (view) {
      case "pretty": {
        makeEditableDom(selected, $("#dom-rendering").empty());
        break;
      }
      case "raw": {
        // Shows the HTML editor 
        makeHtmlEditor($("#dom-rendering"), selected);
        console.log("Selected HTML:");
        console.log(selected);
        break;
      }
    }
  });

  $(".dialog .tab#raw").click();

  return thisDialog;
}

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

    var dialog = createDialog(data, sendMessage);
    var originalHTLM = dialog.getHTML(); // Original HTML to change

    // Update Button
    $("#ok").click(function() {
      console.log("Update");
      if (!responseSent) {
        responseSent = true;
        sendMessage({
          msg: 'ok',
          finished: true,
          endHTML: dialog.getHTML()
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

    var mods = data.mods || {};
    jQuery.loadStylesheets(mods.stylesheets || []);
    jQuery.loadScripts(mods.scripts || []);
  }

  if (isInIframe) {
    window.addEventListener("message", function(event) {
      // Gets the message the whole html.
      console.log("Message Received");
      if (event.data && event.data.length && event.data[0] == '{') {
        loadDialog(JSON.parse(event.data));
      }
    }, false);
  }

});
