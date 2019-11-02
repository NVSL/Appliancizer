export default {
  html:
    '<button id="turnON" onclick="turnLEDON()">LED ON</button>\n\
<button id="turnOFF" onclick="turnLEDOFF()">LED OFF</button>\n\
<span id="myLED">OFF</span>\n\
  \n',
  css: "",
  js:
    'function turnLEDON() {\n\
  var text = document.getElementById("myLED");\n\
  text.innerHTML = "ON";\n\
}\n\
\n\
function turnLEDOFF() {\n\
  var text = document.getElementById("myLED");\n\
  text.innerHTML = "OFF";\n\
}\n\
'
};
