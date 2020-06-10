export default {
  html: `<button id="myButton" onclick="test()">test</button>
<div id="text">Counter: 0</div>`,
  css: `
#text {
  display: inline-block;
}
`,
  js: `var counter = 0;
function test() {
  console.log("button click");
  var text = document.getElementById("text");
  counter++;
  text.innerHTML = "Counter: " + counter;
}`
};
