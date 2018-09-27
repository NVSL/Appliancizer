window.onload = function () {
    const {remote} = require('electron')
    const {Menu, MenuItem} = remote

    var me = this;
    const menu = new Menu()
    menu.append(new MenuItem({label: 'Print...', click() { window.print() }}))
    menu.append(new MenuItem({label: 'Make PCB', click() { generateCoordinates() }}))

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      menu.popup({window: remote.getCurrentWindow()})
    }, false)
}


// #######
// Physical CSS Compiler to device positions
// #######

var $ = require('jquery');
var amalgamCompiler = require('./pcbfy/amalgamCompiler.js');

function generateCoordinates () {

  var rect;

  if (!$("#px_to_mm").length) {
    document.body.innerHTML += '<div id="px_to_mm" style="height:1mm;display:none"></div>';
  }
  var onePixelTomm = $("#px_to_mm").height();
  
  // Get PCB Size
  if (!$("#pcb-top").length) {
    console.error("Filed to Create PCB File: Div 'pcb-top' doesn't exist");
    return;
  }
  var pcbRect = $("#pcb-top")[0].getBoundingClientRect();
  console.log("pcb-top");
  console.log(
    "top:" + (pcbRect.top/onePixelTomm).toString(), 
    "right:" + (pcbRect.right/onePixelTomm).toString(), 
    "bottom:" + (pcbRect.bottom/onePixelTomm).toString(), 
    "left:" + (pcbRect.left/onePixelTomm).toString()
  );

  // Get Screen Size
  var screenRect = $("#physical-screen")[0].getBoundingClientRect();
  console.log("physical-screen");
  console.log(
    "top:" + (screenRect.top/onePixelTomm).toString(), 
    "right:" + (screenRect.right/onePixelTomm).toString(), 
    "bottom:" + (screenRect.bottom/onePixelTomm).toString(), 
    "left:" + (screenRect.left/onePixelTomm).toString()
  );

  if (collisionDetection(pcbRect, screenRect)) {
    console.error("Filed to Create PCB File: #physical-screen outside #pcb boundaries");
  }

  // Get Physical Location of Components
  var physcialCSSDic = amalgamCompiler.getPhysicalHTML();
  for ([selector, physicalHTML] of Object.entries(physcialCSSDic)) {
    console.log(physicalHTML)
    var phyTagName = physicalHTML.split(" ");
    console.log(phyTagName[0].replace("<",""));
    rect = $(selector)[0].getBoundingClientRect();
    var id = $(selector).attr('id');
    console.log(id);
    console.log($(selector).attr('class'));
    console.log(
      "top:" + (rect.top/onePixelTomm).toString(), 
      "right:" + (rect.right/onePixelTomm).toString(), 
      "bottom:" + (rect.bottom/onePixelTomm).toString(), 
      "left:" + (rect.left/onePixelTomm).toString()
    );

    if (collisionDetection(pcbRect, rect)) {
      console.error("Filed to Create PCB File: #"+id+" outside #pcb boundaries");
    }

    if (collisionDetection2(screenRect, rect)) {
      console.error("Filed to Create PCB File: #"+id+" inside #physical-screen boundaries");
    }

  }

}


// Check if components are inside the PCB
function collisionDetection (rect1, rect2) {
  if (rect1.right >= rect2.right &&
      rect1.bottom >= rect2.bottom &&
      rect2.top >= rect1.top && 
      rect2.left >= rect1.left ) {
    // Rec1 inside Rect2 -- OK!
    return 0;
  } else {
    // Rect1 outside Rect2 --  BAD!
    return 1;
  }
}

// Check if components are touching the screen
function collisionDetection2 (rect1, rect2) {
  if (rect1.left < rect2.right &&
   rect1.right > rect2.left &&
   rect1.top < rect2.bottom &&
   rect1.bottom > rect2.top) {
    // Rec1 inside Rect2 -- BAD!
    return 1;
  } else {
    // Rect1 outside Rect2 --  OK!
    return 0;
  }

}