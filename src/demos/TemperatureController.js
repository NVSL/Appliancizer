export default {
  html: `<div id="myTemp">25C</div>
<button id="tempUP">UP</button>
<button id="tempDOWN">DOWN</button>
<input type="range" id="mySensor" min="-45" max="125" step="1" value="25" />
<span id="myOutput"> OFF </span>`,
  css: "",
  js: `var SETPOINT = 25;
var NEW_SETPOINT = SETPOINT;
var CURRENT_TEMP = SETPOINT;
function changeTemp(temp) {
  let myTemp = document.getElementById("myTemp");
  myTemp.innerText = temp + "C";
}
function displayTemp() {
  let myTemp = document.getElementById("myTemp");
  myTemp.style.visibility = "visible";
}
function hideTemp() {
  let myTemp = document.getElementById("myTemp");
  myTemp.style.visibility = "hidden";
}
function toogleTempVisibility() {
  let myTemp = document.getElementById("myTemp");
  let tempVisibility = myTemp.style.visibility;
  if (tempVisibility == "visible") {
    hideTemp();
  } else {
    displayTemp();
  }
}

function checkSetPointTemp(SETPOINT) {
  let myOutput = document.getElementById("myOutput");
  if (CURRENT_TEMP > SETPOINT) {
    myOutput.innerText = "ON";
  } else {
    myOutput.innerText = "OFF";
  }
}

var mySensor = document.getElementById("mySensor");
mySensor.oninput = () => {
  CURRENT_TEMP = mySensor.value;
  changeTemp(CURRENT_TEMP);
  checkSetPointTemp(SETPOINT);
};

// Init SETPOINT
changeTemp(SETPOINT);
console.log("Set point: ", SETPOINT);

// tempreature set mode

// Hide and display text
var oneSecTimer = null;
function startOneSecTimer() {
  oneSecTimer = setInterval(() => {
    toogleTempVisibility();
  }, 500);
}

var sixSecTimer = null;
function startSixSecTimer() {
  displayTemp();
  if (sixSecTimer == null) startOneSecTimer();
  if (sixSecTimer != null) clearTimeout(sixSecTimer);
  sixSecTimer = setTimeout(() => {
    clearInterval(oneSecTimer);
    if (NEW_SETPOINT != SETPOINT) {
      SETPOINT = NEW_SETPOINT;
      console.log("New Set point: ", SETPOINT);
    }
    changeTemp(CURRENT_TEMP);
    checkSetPointTemp(SETPOINT);
    displayTemp();
    sixSecTimer = null;
  }, 6000);
}

let tempUP = document.getElementById("tempUP");
tempUP.addEventListener("click", () => {
  startSixSecTimer();
  NEW_SETPOINT += 1;
  changeTemp(NEW_SETPOINT);
});

let tempDOWN = document.getElementById("tempDOWN");
tempDOWN.addEventListener("click", () => {
  startSixSecTimer();
  NEW_SETPOINT -= 1;
  changeTemp(NEW_SETPOINT);
});`,
};
