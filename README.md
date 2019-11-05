# Appliancizer Client

## Project setup
```
npm install
```

### Run client (prefered port: 8080)
```
npm run serve
```

# Appliancizer Server

### Project setup
```
cd server
npm install
```

### Run server (runs on port 8081)
```
npm run start
```

# Gadgetron related

### File pcb input example for gadgetron
Generated automatically in: ```server/gadgetron/pcbInput.json``` after clicking (BUILD->DOWNLOAD PCB FILES)
```json
{
  "pcbHeight": 120,
  "pcbWidth": 120,
  "availableGpio": [
    "4",
    "17",
    "27",
    "22",
    "5",
    "6",
    "13",
    "26",
    "18",
    "23",
    "24",
    "25",
    "12"
  ],
  "availableI2c": [
    "/dev/i2c-1"
  ],
  "availableSpi": [
    "/dev/spidev0.0"
  ],
  "availableSerial": [
    "/dev/spidev0.0"
  ],
  "part0": {
    "componentName": "LED-5mm-red",
    "componentWidth": "5mm",
    "componentHeight": "5mm",
    "componentX": 14.5,
    "componentY": 12.5,
    "gpio": [
      "4"
    ],
    "i2c": [],
    "spi": [],
    "serial": []
  },
  "part1": {
    "componentName": "physical-button-red",
    "componentWidth": "10mm",
    "componentHeight": "10mm",
    "componentX": 15,
    "componentY": 24,
    "gpio": [
      "17"
    ],
    "i2c": [],
    "spi": [],
    "serial": []
  },
  "part2": {
    "componentName": "physical-button-red",
    "componentWidth": "10mm",
    "componentHeight": "10mm",
    "componentX": 5,
    "componentY": 5,
    "gpio": [
      "27"
    ],
    "i2c": [],
    "spi": [],
    "serial": []
  }
}
```    

### Where pcbInput.json is generated and where Gadgetron things should be executed?  
Here: ```server/src/app.js```  
Where exactly? Here:  
app.js  
```js
....
// Generate PCB
app.post("/generatePCB", function(req, res) {
...
//pcbInput.json is generated
...
  // #####
  // DO SOMETHING WITH GADGETRON HERE!!!
  // #####
...
}
```
