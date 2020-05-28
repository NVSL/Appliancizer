//
// Create and drop tables for testing and production
//
const Pool = require("pg").Pool;
const bcrypt = require("bcrypt");
require("dotenv").config({
  // Load envarioment variables for development or production
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development"
});

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.on("connect", () => {
  console.log("## Connected to the database ##");
});

//
// TABLES;
//

const tableUsers = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL UNIQUE CHECK (LENGTH(username) > 0),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (LENGTH(email) > 0),
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 8),
  security_level VARCHAR(20) NOT NULL DEFAULT 'user',
  created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

const tableProjects = `
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(25) NOT NULL,
  projectname VARCHAR(30) NOT NULL CHECK (LENGTH(projectname) > 0),
  projectimage BYTEA,
  project JSONB DEFAULT NULL,
  updated_date TIMESTAMPTZ NOT NULL,
  created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

//
//  FUNCTIONS;
//

const resetTables = async () => {
  try {
    // Drop tables
    await pool.query("DROP TABLE IF EXISTS projects");
    await pool.query("DROP TABLE IF EXISTS users");
    // Create Tables
    await pool.query(tableUsers);
    console.log("## TABLE USERS HAS BEEN RESET ##");
    await pool.query(tableProjects);
    console.log("## TABLE RPOJECTS HAS BEEN RESET ##");
  } catch (err) {
    console.log(err.stack);
  }
};

const resetTablesWithData = async () => {
  try {
    await resetTables();
    //
    // ADD USERS DATA
    //
    // Hash user password
    const salt = await bcrypt.genSalt();
    const hashPassowrd = await bcrypt.hash("password", salt);
    await pool.query(
      `INSERT INTO users (username, email, password) 
        VALUES ('jerom', 'jerom@example.com', $1)`,
      [hashPassowrd]
    );
    await pool.query(
      `INSERT INTO users (username, email, password, security_level) 
        VALUES ('admin', 'admin@example.com', $1, 'admin')`,
      [hashPassowrd]
    );
    console.log("## USERS HAVE BEEN ADDED ##");
    //
    // ADD PROJECTS DATA
    //
    await pool.query(
      `INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date)
        VALUES (1, 'jerom', 'pikachu', decode('${buttonImage}','base64'),
        '${JSON.stringify(simpleCounter)}', NOW());`
    );
    await pool.query(
      `INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date)
        VALUES (1, 'jerom', 'pidgoto', decode('${buttonLedImage}','base64'),
        '${JSON.stringify(simpleLED)}', NOW());
      `
    );
    await pool.query(
      `INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date)
       VALUES (2, 'admin', 'pikachu', decode('${buttonImage}','base64'),
       '${JSON.stringify(simpleCounter)}', NOW());`
      // `INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date)
      //  VALUES (2, 'admin', 'charmander', pg_read_binary_file('demo1.png'),
      //  '{"project": "Hello Admin World"}', NOW());`
    );
    console.log("## PROJECTS HAVE BEEN ADDED ##");
  } catch (err) {
    console.log(err.stack);
  }
};

//
// PROJECTS FUNCTIONS;
//

module.exports = {
  resetTables,
  resetTablesWithData
};

//
// EXAMPLE OF IMAGES;
//

var buttonImage =
  "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";
var buttonLedImage =
  "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";

//
// PROJECT SAMPLE
//
var simpleCounter = {
  projectname: "pikachu",
  FinalPCB_height: 24,
  FinalPCB_width: 57,
  hdmiScreens_current: "MONITOR",
  EditorHTMLText:
    '<button id="myButton" onclick="test()">test</button>\n<div id="text">Counter: 0</div>',
  EditorCSSText:
    "button {\n  color: blue;\n}\n\n#text {\n  display: inline-block;\n}\n",
  EditorJSText:
    'var counter = 0;\nfunction test() {\n  console.log("button click");\n  var text = document.getElementById("text");\n  counter++;\n  text.innerHTML = "Counter: " + counter;\n}',
  eComponentSaved: {
    connector: {
      elementId: "element_0",
      type: "connector",
      componentSelected: 0,
      componentName: "J1",
      componentDescription: "Raspberry Pi Connector",
      componentSchematic: "connector_raspberrypi",
      componentConnectorNetMap: {
        allNets: [
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
          "12",
          "16",
          "19",
          "20",
          "21",
          "2",
          "3",
          "9",
          "10",
          "11",
          "8",
          "14",
          "15",
          "3.3V",
          "5V"
        ],
        gpio: [
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
          "12",
          "16",
          "19",
          "20",
          "21"
        ],
        i2c: {
          "0": {
            device: "/dev/i2c-1",
            type: "i2c",
            SDA: "2",
            SCL: "3"
          }
        },
        spi: {
          "0": {
            device: "/dev/spidev0.0",
            type: "spi",
            MOSI: "10",
            MISO: "9",
            SCLK: "11",
            CE0: "8"
          }
        },
        serial: {
          "0": {
            device: "/dev/ttyUSB0",
            type: "serial",
            TXD: "14",
            RXD: "15"
          }
        }
      },
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/PRT-14017/1568-1462-ND/6569366",
      componentPartImage: "connectors/rpi_connector_partimage.jpg",
      componentImage: "connectors/rpi_connector.png",
      componentWidth: "51mm",
      componentHeight: "7mm",
      componentChildIDs: [],
      componentIfaces: {},
      componentLeft: 1,
      componentTop: 2,
      componentCenterLeft: 26.5,
      componentCenterTop: 5.5,
      html: '<div id="connector"></div>',
      width: 0,
      height: 0,
      innerHTML: ""
    },
    myButton: {
      elementId: "element_1",
      type: "submit",
      componentSelected: 0,
      componentName: "S1",
      componentDescription: "Tactile Push Button smd",
      componentSchematic: "tactile_push_button_smd",
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/c-k/PTS645SL50SMTR92-LFS/CKN9088CT-ND/1146811",
      componentHardElement: "physical-button",
      componentHardElementVars: '(gpio:"4")',
      componentPartImage: "buttons/smd-button.png",
      componentImage: "buttons/smd-button.svg",
      componentWidth: "9.5mm",
      componentHeight: "6mm",
      componentRequires: ["resistor_1206_10k"],
      componentChildIDs: ["resistor_1206_10k_2"],
      componentIfaces: {
        iface_0: {
          type: "gpio",
          GPIO: "4"
        }
      },
      componentLeft: 2,
      componentTop: 11,
      componentCenterLeft: 6.75,
      componentCenterTop: 14,
      html: '<button id="myButton" onclick="test()">test</button>',
      width: 26.5781,
      height: 25,
      innerHTML: "test"
    },
    resistor_1206_10k_2: {
      elementId: "element_2",
      type: "misc",
      componentSelected: 0,
      componentName: "R1",
      componentDescription: "10k resistor smd 1206",
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/yageo/RC1206JR-0710KL/311-10KERCT-ND/732156",
      componentPartImage: "misc/0603-RES.jpg",
      componentImage: "misc/0603-RES.svg",
      componentWidth: "4.5mm",
      componentHeight: "2mm",
      componentChildIDs: [],
      componentIfaces: {},
      componentLeft: 14,
      componentTop: 13,
      componentCenterLeft: 16.25,
      componentCenterTop: 14,
      html: '<div id="resistor_1206_10k_2" class="misc"></div>',
      width: 0,
      height: 0,
      innerHTML: ""
    }
  },
  eAvailableComponents: ["myButton"],
  nonAvailableComponents: ["text"],
  webpageContainer:
    '<div id="myButton_drag" class="draggable_element" draggable="true" style="width:33.5781px;height:32px;display:inline-block;">\n                </div>\n<div id="text_nondrag" class="none_draggable_element" style="width:71.375px;height:27px;display:inline-block;">\n                <div id="text">Counter: 0</div></div>',
  PCB:
    '<div id="element_0" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 5px; top: 10px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><div id="connector" style="background-image: url(&quot;/img/rpi_connector.aac5f0c0.png&quot;); height: 7mm; width: 51mm;"></div></div><div id="element_1" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 10.7031px; top: 43.6563px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><button id="myButton" onclick="test()" class="submit-physical-button" style="background-image: url(&quot;/img/smd-button.359a9e5f.svg&quot;); height: 6mm; width: 9.5mm;"></button></div><div id="element_2" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 54px; top: 50px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><div id="resistor_1206_10k_2" class="misc" style="background-image: url(&quot;/img/0603-RES.6db73cae.svg&quot;); height: 2mm; width: 4.5mm;"></div></div>'
};

var simpleLED = {
  projectname: "pidgoto",
  FinalPCB_height: 26,
  FinalPCB_width: 57,
  hdmiScreens_current: "MONITOR",
  EditorHTMLText:
    '<button id="turnON" onclick="turnLEDON()">LED ON</button>\n<button id="turnOFF" onclick="turnLEDOFF()">LED OFF</button>\n<span id="myLED">OFF</span>\n  \n',
  EditorCSSText: "",
  EditorJSText:
    'function turnLEDON() {\n  var text = document.getElementById("myLED");\n  text.innerHTML = "ON";\n}\n\nfunction turnLEDOFF() {\n  var text = document.getElementById("myLED");\n  text.innerHTML = "OFF";\n}\n',
  eComponentSaved: {
    connector: {
      elementId: "element_0",
      type: "connector",
      componentSelected: 0,
      componentName: "J1",
      componentDescription: "Raspberry Pi Connector",
      componentSchematic: "connector_raspberrypi",
      componentConnectorNetMap: {
        allNets: [
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
          "12",
          "16",
          "19",
          "20",
          "21",
          "2",
          "3",
          "9",
          "10",
          "11",
          "8",
          "14",
          "15",
          "3.3V",
          "5V"
        ],
        gpio: [
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
          "12",
          "16",
          "19",
          "20",
          "21"
        ],
        i2c: {
          "0": {
            device: "/dev/i2c-1",
            type: "i2c",
            SDA: "2",
            SCL: "3"
          }
        },
        spi: {
          "0": {
            device: "/dev/spidev0.0",
            type: "spi",
            MOSI: "10",
            MISO: "9",
            SCLK: "11",
            CE0: "8"
          }
        },
        serial: {
          "0": {
            device: "/dev/ttyUSB0",
            type: "serial",
            TXD: "14",
            RXD: "15"
          }
        }
      },
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/PRT-14017/1568-1462-ND/6569366",
      componentPartImage: "connectors/rpi_connector_partimage.jpg",
      componentImage: "connectors/rpi_connector.png",
      componentWidth: "51mm",
      componentHeight: "7mm",
      componentChildIDs: [],
      componentIfaces: {},
      componentLeft: 1,
      componentTop: 2,
      componentCenterLeft: 26.5,
      componentCenterTop: 5.5,
      html: '<div id="connector"></div>',
      width: 0,
      height: 0,
      innerHTML: ""
    },
    turnON: {
      elementId: "element_1",
      type: "submit",
      componentSelected: 0,
      componentName: "S1",
      componentDescription: "Tactile Push Button smd",
      componentSchematic: "tactile_push_button_smd",
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/c-k/PTS645SL50SMTR92-LFS/CKN9088CT-ND/1146811",
      componentHardElement: "physical-button",
      componentHardElementVars: '(gpio:"4")',
      componentPartImage: "buttons/smd-button.png",
      componentImage: "buttons/smd-button.svg",
      componentWidth: "9.5mm",
      componentHeight: "6mm",
      componentRequires: ["resistor_1206_10k"],
      componentChildIDs: ["resistor_1206_10k_2"],
      componentIfaces: {
        iface_0: {
          type: "gpio",
          GPIO: "4"
        }
      },
      componentLeft: 2,
      componentTop: 12,
      componentCenterLeft: 6.75,
      componentCenterTop: 15,
      html: '<button id="turnON" onclick="turnLEDON()">LED ON</button>',
      width: 56.125,
      height: 25,
      innerHTML: "LED ON"
    },
    resistor_1206_10k_2: {
      elementId: "element_2",
      type: "misc",
      componentSelected: 0,
      componentName: "R1",
      componentDescription: "10k resistor smd 1206",
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/yageo/RC1206JR-0710KL/311-10KERCT-ND/732156",
      componentPartImage: "misc/0603-RES.jpg",
      componentImage: "misc/0603-RES.svg",
      componentWidth: "4.5mm",
      componentHeight: "2mm",
      componentChildIDs: [],
      componentIfaces: {},
      componentLeft: 15,
      componentTop: 14,
      componentCenterLeft: 17.25,
      componentCenterTop: 15,
      html: '<div id="resistor_1206_10k_2" class="misc"></div>',
      width: 0,
      height: 0,
      innerHTML: ""
    },
    myLED: {
      elementId: "element_3",
      type: "span",
      componentSelected: 0,
      componentName: "LED1",
      componentDescription: "LED Thruhole 5mm red",
      componentSchematic: "led_thruhole",
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/cree-inc/C503B-RAN-CZ0C0AA1/C503B-RAN-CZ0C0AA1-ND/6561758",
      componentHardElement: "physical-output",
      componentHardElementVars: '(gpio:"17")',
      componentPartImage: "output/LED-RED.jpg",
      componentImage: "output/red-5mm-LED.2D.svg",
      componentWidth: "5mm",
      componentHeight: "5mm",
      componentRequires: ["resistor_1206_330ohm"],
      componentChildIDs: ["resistor_1206_330ohm_4"],
      componentIfaces: {
        iface_0: {
          type: "gpio",
          GPIO: "17"
        }
      },
      componentLeft: 25,
      componentTop: 13,
      componentCenterLeft: 27.5,
      componentCenterTop: 15.5,
      html: '<span id="myLED">OFF</span>',
      width: 28,
      height: 16,
      innerHTML: "OFF"
    },
    resistor_1206_330ohm_4: {
      elementId: "element_4",
      type: "misc",
      componentSelected: 0,
      componentName: "R1",
      componentDescription: "330 Ohm resistor smd 1206",
      componentBuyLink:
        "https://www.digikey.com/product-detail/en/yageo/RC1206JR-07330RL/311-330ERCT-ND/732226",
      componentPartImage: "misc/0603-RES.jpg",
      componentImage: "misc/0603-RES.svg",
      componentWidth: "4.5mm",
      componentHeight: "2mm",
      componentChildIDs: [],
      componentIfaces: {},
      componentLeft: 35,
      componentTop: 14,
      componentCenterLeft: 37.25,
      componentCenterTop: 15,
      html: '<div id="resistor_1206_330ohm_4" class="misc"></div>',
      width: 0,
      height: 0,
      innerHTML: ""
    }
  },
  eAvailableComponents: ["turnON", "turnOFF", "myLED"],
  nonAvailableComponents: [],
  webpageContainer:
    '<div id="turnON_drag" class="draggable_element" draggable="true" style="width:63.125px;height:32px;display:inline-block;">\n                </div>\n<div id="turnOFF_drag" class="draggable_element" draggable="true" style="width:70.125px;height:32px;display:inline-block;">\n                <button id="turnOFF" onclick="turnLEDOFF()">LED OFF</button></div>\n<div id="myLED_drag" class="draggable_element" draggable="true" style="width:35px;height:23px;display:inline-block;">\n                </div>\n  \n',
  PCB:
    '<div id="element_0" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 5px; top: 10px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><div id="connector" style="background-image: url(&quot;/img/rpi_connector.aac5f0c0.png&quot;); height: 7mm; width: 51mm;"></div></div><div id="element_1" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 10.0469px; top: 47.6563px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><button id="turnON" onclick="turnLEDON()" class="submit-physical-button" style="background-image: url(&quot;/img/smd-button.359a9e5f.svg&quot;); height: 6mm; width: 9.5mm;"></button></div><div id="element_2" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 59px; top: 55px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><div id="resistor_1206_10k_2" class="misc" style="background-image: url(&quot;/img/0603-RES.6db73cae.svg&quot;); height: 2mm; width: 4.5mm;"></div></div><div id="element_3" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 94.5469px; top: 50.5469px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><span id="myLED" class="submit-physical-button" style="background-image: url(&quot;/img/red-5mm-LED.2D.7c46147d.svg&quot;); height: 5mm; width: 5mm;"></span></div><div id="element_4" class="noGlobalTrigger ui-draggable ui-draggable-handle" style="position: absolute; display: inline-block; border-radius: 5px; border: 3px solid transparent; left: 133px; top: 55px;"><div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div><div id="resistor_1206_330ohm_4" class="misc" style="background-image: url(&quot;/img/0603-RES.6db73cae.svg&quot;); height: 2mm; width: 4.5mm;"></div></div>'
};
