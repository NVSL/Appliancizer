export default {
  html:
    '<button id="myButton" onclick="test()">test</button>\n\
<br>\n\
<div id="text">Counter: 0</div>\n',
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
    'var counter = 0;\n\
function test() {\n\
  console.log("button click");\n\
  var text = document.getElementById("text");\n\
  counter++;\n\
  text.innerHTML = "Counter: " + counter;\n\
}\n\
'
};
