class PHYSICAL_TEMP_SENSOR extends HTMLElement {

	// TODO TEST TEMP SENSOR
	constructor () {
		super();
		this.oninput;
		this.min;
		this.max;
		this.step;

		// Hard attributes
		this.Wire = null;
		this.i2cport = null;
		this.i2caddr = null;

		// Libraries
		this.Sensor = require(global.appbasedir + "/amalgam/libraries/Adafruit_MCP9808");
	}

	readTEMP (milliseconds) {

	  this.timerfunc = setTimeout(() => {

			// Read adc
			let tempValue = Math.round(this.Sensor.readTempC(this.i2caddr)/this.step)*this.step;

	    // Range value
	    if (tempValue > this.max) tempValue = this.max;
	    if (tempValue < this.min) tempValue = this.min;

			this.value = tempValue;
			this.oninput();

	  	this.readTEMP(milliseconds);
		}, milliseconds);
  }

	// Monitor the 'name' attribute for changes.
  static get observedAttributes() {
  	return ['min', 'max', 'step', 'i2c-port', 'i2c-addr']; 
  }

  connectedCallback() {
    console.log("Physical Temp Sensor Connected");

    // Check attributes
    if (typeof this.oninput !== 'function' && 
			this.min == undefined 		&&
			this.max == undefined 		&&
			this.step == undefined 		&& 
			this.i2caddr == undefined) {
    	console.error("Undefined attribute or function");
    	console.error("oninput", typeof this.oninput)
      console.error("min", this.min);
	    console.error("max", this.max);
	    console.error("step", this.step);
	    console.error("i2cport", this.i2cport);
	    console.error("i2caddr", this.i2caddr.toString(16));
	    return;
    }

    // Initialize Sensor
    let res = this.Sensor.initMCP9808(this.i2cport, this.i2caddr);
    if (res == false) return;

    console.log("Physical Temp Sensor Ready");

    this.readTEMP(1000);
  }

	// Respond to attribute changes.
	attributeChangedCallback(attr, oldValue, newValue) {

		if (attr == 'min') {
			this.min = parseInt(newValue);
    } else if (attr == 'max') {
    	this.max = parseInt(newValue);
    } else if (attr == 'step') {
    	this.step = parseInt(newValue);
    } else if (attr == 'i2c-port') {
    	this.i2cport = newValue;
    } else if (attr == 'i2c-addr') {
    	this.i2caddr = parseInt(newValue);
    }
    
  }

}
