class PHYSICAL_OUTPUT extends HTMLElement {
  constructor() {
    super();
    this.gpio;
    this.gpioLevel = 0;
  }
  changeGPIOLevel(text, isInit) {
    if (text.toLowerCase() == "on") {
      // Turn on Output
      this.gpioLevel = 1;
      console.log("GPIO LEVEL: " + this.gpioLevel);
      Linuxduino.digitalWrite(this.gpio, this.gpioLevel);
    } else if (text.toLowerCase() == "off") {
      // Turn off Output
      this.gpioLevel = 0;
      console.log("GPIO LEVEL: " + this.gpioLevel);
      Linuxduino.digitalWrite(this.gpio, this.gpioLevel);
    } else {
      // toogle LED except at init
      if (!isInit) {
        this.gpioLevel ^= 1;
        console.log("GPIO LEVEL: " + this.gpioLevel);
        Linuxduino.digitalWrite(this.gpio, this.gpioLevel);
      }
    }
  }

  // Monitor attribute changes.
  static get observedAttributes() {
    return ["gpio"];
  }

  // Respond to attribute changes.
  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr == "gpio") {
      this.gpio = parseFloat(newValue);
      console.log("GPIO: ", this.gpio);
    }
  }

  // on Web Comopnent connected
  connectedCallback() {
    // Init GPIO
    Linuxduino.pinMode(this.gpio, Linuxduino.OUTPUT);
    // Set inital levels
    this.changeGPIOLevel(this.innerHTML, true);

    // Observe inner text changes
    var observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        //Detect <img> insertion
        if (mutation.type === "childList") {
          var text = this.innerHTML;
          this.changeGPIOLevel(text, false);
        }
      });
    });

    observer.observe(this, { childList: true });
  }
}
