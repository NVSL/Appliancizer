export default {
  html:
    '<button id="myButton" onclick="test()">test</button>\n\
<br>\n\
<div id="text">OFF</div>\n',
  css:
    "button {\n\
  color: blue;\n\
}\n\
\n\
#text {\n\
  display: inline-block;\n\
}\n\
",
  js:
    'function test() {\n\
  console.log("button click");\n\
  var text = document.getElementById("text");\n\
  if (text.innerHTML == "OFF") {\n\
      text.innerHTML = "ON";\n\
  } else {\n\
      text.innerHTML = "OFF";\n\
  }\n\
}\n\
'
};
