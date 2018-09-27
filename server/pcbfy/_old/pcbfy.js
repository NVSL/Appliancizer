class PCBTOP extends HTMLElement {

	constructor () {
		super();
	}

  connectedCallback() {
    console.log("PCB TOP Ready");
    // Style   
    this.style.display = "block";
    this.style.backgroundColor = "green";
    this.style.border = "2px solid #000000";
  }

  static get observedAttributes() {
    return ['width', 'height']; 
  }

  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr == 'width') {
      this.style.width = newValue; 
    } else if (attr == 'height') {
      this.style.height = newValue; 
    }

  }

}

class PCBBOTTOM extends HTMLElement {

  constructor () {
    super();
  }

  connectedCallback() {
    console.log("PCB Bottom Ready");
    // Style   
    this.style.display = "block";
    this.style.backgroundColor = "blue";
    this.style.border = "2px solid #000000";
  }

  static get observedAttributes() {
    return ['width', 'height']; 
  }

  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr == 'width') {
      this.style.width = newValue; 
    } else if (attr == 'height') {
      this.style.height = newValue; 
    }

  }

}

class PCBPRINTBUTTON extends HTMLElement {

  constructor () {
    super();
    this.addEventListener('click', e => this.printWindow());
  }

  connectedCallback() {
    console.log("PCB Button Print Ready");
    // Style   
    this.style.display = "inline-block";
    this.style.color = "#444";
    this.style.border = "1px solid #CCC";
    this.style.background = "#DDD";
    this.style.boxShadow = "0 0 5px -1px rgba(0,0,0,0.2)";
    this.style.cursor = "pointer";
    this.style.verticalAlign = "middle";
    this.style.maxWidth = "100px";
    this.style.padding = "5px";
    this.style.textAlign = "center";
    this.style.margin = "5px";
    // Text
    this.innerText = "PCB PDF";
  }

  printWindow () {
    window.print()
  }

}

class ELECTRONPRINT extends HTMLElement {

  constructor () {
    super();
  }

  connectedCallback() {
    console.log("Electron Print Ready");

    const {remote} = require('electron')
    const {Menu, MenuItem} = remote

    var me = this;
    const menu = new Menu()
    menu.append(new MenuItem({label: 'Print...', click() { window.print() }}))
    menu.append(new MenuItem({label: 'Make PCB', click() { me.generateCoordinates() }}))

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      menu.popup({window: remote.getCurrentWindow()})
    }, false)
  }

  generateCoordinates () {
    var all_elements = document.getElementsByTagName("*");

    var max = 10000;
    for (var i=0, max=all_elements.length; i < max; i++) {
      // Do something with the element here
      var e = all_elements[i];
      var id = e.id;
      var tag = e.tagName;

      if (id) {
        console.log(e);
        console.log("id:");
        console.log(id);
        console.log("tag:");
        console.log(tag);
        console.log("position:")
        var rect = e.getBoundingClientRect();
        console.log(
          "top:" + rect.top.toString(), 
          "right:" + rect.right.toString(), 
          "bottom:" + rect.bottom.toString(), 
          "left:" + rect.left.toString()
        );

        console.log("\n");
      }
    }
  }

}


class PHYSICALSCREEN extends HTMLElement {

  constructor () {
    super();
  }

  connectedCallback() {
    console.log("Physical Screen Ready");
    // Style   
    this.style.display = "block";
  }

  static get observedAttributes() {
    return ['width', 'height']; 
  }

  attributeChangedCallback(attr, oldValue, newValue) {

    if (attr == 'width') {
      this.style.width = newValue; 
    } else if (attr == 'height') {
      this.style.height = newValue; 
    }

  }

}


// #######
// Make PCBFY Web Components Availabel 
// #######

customElements.define('pcb-top', PCBTOP);
customElements.define('pcb-bottom', PCBBOTTOM);
customElements.define('pcb-button-print', PCBPRINTBUTTON);
customElements.define('electron-print', ELECTRONPRINT);
customElements.define('physical-screen', PHYSICALSCREEN);