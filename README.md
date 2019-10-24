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
npm install
```

### Run server (runs on port 8081)
```
cd server
npm run start
```

# Gadgetron related

### Gadgetron Folder  
Gadgetron folder is in ``` server/gadgetron ```

### Where Gadgetron should be executed  
File: server/src/app.js
Code:
```js
// Generate PCB
app.post("/generatePCB", function(req, res) {
...
  // #####
  // DO SOMETHING WITH GADGETRON HERE!!!
  // #####
...
}
```

### File pcb input example for gadgetron
Generated automatically in: ```server/gadgetron/pcbInput.json```
```json
{
  "pcbHeight": 120,
  "pcbWidth": 120,
  "part0": {
    "componentName": "physical-button-red",
    "componentWidth": "10mm",
    "componentHeight": "10mm",
    "componentX": 15,
    "componentY": 12,
    "gpio": [
      "4"
    ],
    "i2c": [],
    "spi": [],
    "serial": []
  },
  "part1": {
    "componentName": "LED-5mm-red",
    "componentWidth": "5mm",
    "componentHeight": "5mm",
    "componentX": 13.5,
    "componentY": 25.5,
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
