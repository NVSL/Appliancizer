// EXPRESS NO SQL
// npm start
// npm install --save (module)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const path = require("path");

// Get requests shouldn't change any data (Ony for getting info)
// - Variables are embedded in the URL
// Post request make important changes (Buy, create account, upload, etc)
// - Variables are embedded in the body of the msg.
// - Refreching a POST request will pupop an alert

// build mini web app
const app = express();
app.use(morgan("combined")); // Prints all devices that have requested data.
app.use(bodyParser.json()); // Allows getting req.body.{jsonparam} in POST
app.use(cors());
app.use(fileUpload()); // Allows getting req.files with the file data.

// Run Server
const SERVER_PORT = 3000;
app.listen(SERVER_PORT);
console.log(`Server Running on http://localhost:${SERVER_PORT} ...`);

const LOCALHOST_PORT = "8088";
var PUBLIC_PATH;
var WEB_URL;
if (process.env.NODE_ENV === "production") {
  // Set Production variables
  WEB_URL = "https://appliancizer.com";
  console.log(`Open proxy ${WEB_URL}/api/status for a quick check`);
  PUBLIC_PATH = "dist"; // HTML files
} else {
  // Set Develpmnet variables
  WEB_URL = "http://localhost";
  console.log(`Open ${WEB_URL}:${SERVER_PORT}/api/status for a quick check`);
  PUBLIC_PATH = "public"; // HTML files
}

// Without sequelize
// Send JSON
app.get("/api/status", (req, res) => {
  res.send({
    message: "Server Running Fine :D",
  });
});

// Get FILE (will download as (file.zip))
app.get("/api/file", (req, res) => {
  res.sendFile(__dirname + "/lol.zip");
});

// Get FILE (will download as (:name.zip))
app.get("/api/file/:name", (req, res, next) => {
  var fileName = req.params.name;
  res.sendFile(__dirname + "/" + fileName, function(err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});

// Upload Files
app.post("/api/upload", function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send("No files were uploaded.");
  }
  console.log("Files to Upload:", req.files);
  let userFile = req.files.file;

  // Use the mv() method to place the file somewhere on your server
  userFile.mv(__dirname + "/uploads/" + userFile.name, function(err) {
    if (err) return res.status(500).send(err);
    res.send("File uploaded!");
  });
});
// TEST FILE UPLOAD:
/*
<html>
  <body>
    <form ref='uploadForm' 
      id='uploadForm' 
      action='http://localhost:8081/upload' 
      method='post' 
      encType="multipart/form-data">
        <input type="file" name="file" />
        <input type='submit' value='Upload!' />
    </form>     
  </body>
</html>
*/

// Authenticate user
app.post("/api/register", function(req, res) {
  res.send({
    message: `Hello ${req.body.email}! your user was registered!`,
  });
});

// ####
// In Production QUERIES
// ####

// Download files (GET, /download/{filename})
app.get("/api/download/:file(*)", (req, res) => {
  var file = req.params.file;
  var fileLocation = path.join("./files", file);
  console.log(fileLocation);
  res.download(fileLocation, file);
});

app.get("/api/amalgamFiles", (req, res) => {
  // Read amalgam.html
  var amalgamHTML = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/amalgam.html`,
    "utf8"
  );

  // Read amalgam.js
  var amalgamJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/amalgam.js`,
    "utf8"
  );

  // Read physical-button.js
  var physicalButtonJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/physical-button.js`,
    "utf8"
  );

  // Read physical-motorized-pot.js
  var physicalMotorizedPotJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/physical-motorized-pot.js`,
    "utf8"
  );

  // Read physical-pot.js
  var physicalPotJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/physical-pot.js`,
    "utf8"
  );

  // Read physical-rgb-led.js
  var physicalRgbLedJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/physical-rgb-led.js`,
    "utf8"
  );

  // Read physical-servo-motor.js
  var physicalServoMotorJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/physical-servo-motor.js`,
    "utf8"
  );

  // Read physical-output.js
  var physicalOutputJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/physical-output.js`,
    "utf8"
  );

  // Read test-physical-button.js
  var testPhysicalButtonJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/test-physical-button.js`,
    "utf8"
  );

  // Read test-physical-submit.js
  var testPhysicalSubmitJS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/test-physical-submit.js`,
    "utf8"
  );

  // Read board pinouts / raspberrypi_pinout.css
  var raspberryPinoutCSS = fs.readFileSync(
    `../${PUBLIC_PATH}/amalgamNative/boards_pinout/raspberrypi_pinout.css`,
    "utf8"
  );

  res.send({
    message: [
      { filename: "amalgam.html", data: amalgamHTML, folder: "" },
      { filename: "amalgam.js", data: amalgamJS, folder: "" },
      { filename: "physical-button.js", data: physicalButtonJS, folder: "" },
      {
        filename: "physical-motorized-pot.js",
        data: physicalMotorizedPotJS,
        folder: "",
      },
      { filename: "physical-pot.js", data: physicalPotJS, folder: "" },
      { filename: "physical-rgb-led.js", data: physicalRgbLedJS, folder: "" },
      {
        filename: "physical-servo-motor.js",
        data: physicalServoMotorJS,
        folder: "",
      },
      { filename: "physical-output.js", data: physicalOutputJS, folder: "" },
      {
        filename: "test-physical-button.js",
        data: testPhysicalButtonJS,
        folder: "",
      },
      {
        filename: "test-physical-submit.js",
        data: testPhysicalSubmitJS,
        folder: "",
      },
      {
        filename: "raspberrypi_pinout.css",
        data: raspberryPinoutCSS,
        folder: "boards_pinout",
      },
    ],
  });
});

// Generate web page
app.post("/api/generateWebPage", function(req, res) {
  console.log("\n USER NAME: ", req.body.userName);
  console.log("\n USER HTML: ", req.body.htmlDoc);
  console.log("\n USER CSS: ", req.body.cssDoc);

  const userName = req.body.userName;
  // Create index.html file
  fs.writeFile(
    `../${PUBLIC_PATH}/userapps/${userName}/index.html`,
    req.body.htmlDoc,
    function(err) {
      if (err) {
        res.status(500).send({
          error: "Server error when creating html File",
        });
        throw err;
      }
    }
  );

  // Create hardware.css file
  fs.writeFile(
    `../${PUBLIC_PATH}/userapps/${userName}/hardware.css`,
    req.body.cssDoc,
    function(err) {
      if (err) {
        res.status(500).send({
          error: "Server error when creating css File",
        });
        throw err;
      }
    }
  );

  // Copy amalgamNative folder to the user folder
  fs.copySync(
    `../${PUBLIC_PATH}/amalgamNative`,
    `../${PUBLIC_PATH}/userapps/${userName}/amalgam`
  );

  // If success send the user a link back
  if (process.env.NODE_ENV === "production") {
    res.send({
      link: `${WEB_URL}/userapps/${userName}`,
    });
  } else {
    res.send({
      link: `${WEB_URL}:${LOCALHOST_PORT}/userapps/${userName}`,
    });
  }
});

// Generate PCB
app.post("/api/generatePCB", function(req, res) {
  console.log("\n######\n###### Generating PCB \n######");
  console.log("PCB INPUT:\n", JSON.stringify(req.body.pcbInput, null, 2));

  // Run Gadgetron modules combinator
  let spawn = require("child_process").spawn;
  let pyprog = spawn("python3", [
    "../../json_to_eagle_brd/builder.py",
    "-i",
    JSON.stringify(req.body.pcbInput),
  ]);

  pyprog.stderr.on("data", (data) => {
    // Data error
    console.log("\nDATA ERROR:\n", data.toString("utf8"));
  });

  pyprog.stdout.on("data", function(data) {
    console.log("\nDATA GOOD:\n", data.toString("utf8"));
  });

  pyprog.on("exit", function(code) {
    if (code == "0") {
      // Process finish correctly
      try {
        // Get PCB, if it doesn't exist then combined board failed.
        fs.readFileSync("../../json_to_eagle_brd/COMBINED.brd", "utf8");
      } catch (err) {
        console.log(err.stack);
        res.status(500).send({ error: "Server error" });
        console.log("\n######\n###### END Generating PCB (Fail) \n######");
        return;
      }
      res.send({ message: "Success" });
      console.log("\n######\n###### END Generating PCB (Success) \n######");
    } else {
      // Process error
      res.status(500).send({ error: "Server error" });
      console.log("\n######\n###### END Generating PCB (Fail) \n######");
    }
  });
});

app.get("/api/autoroutePCB", function(req, res) {
  console.log("\n######\n###### Autorouting PCB \n######");
  // TODO kill any eagle process

  // Delete output file if it exists
  let routedFilePath = "../../json_to_eagle_brd/ROUTED.brd";
  if (fs.existsSync(routedFilePath)) {
    fs.unlinkSync(routedFilePath);
  }

  let spawn = require("child_process").spawn;
  let eagleAutoroute = spawn("../../eagle-9.4.2/eagle", [
    "../../json_to_eagle_brd/COMBINED.brd",
    "-CAUTO;WRITE @ROUTED.brd;QUIT;",
  ]);
  // Set timeout for eagle autoruter
  setTimeout(function() {
    // If process hasn't reported an exist status yet, kill it.
    if (eagleAutoroute.exitCode == null) {
      eagleAutoroute.stdin.pause();
      eagleAutoroute.kill();
      console.log("\n######\n###### Autorouting PCB (Timeout) \n######");
      return;
    }
  }, 300000); // 5 mins max

  eagleAutoroute.stderr.on("data", (data) => {
    // Data error
    console.log("\nDATA ERROR:\n", data.toString("utf8"));
  });

  eagleAutoroute.stdout.on("data", function(data) {
    console.log("\nDATA GOOD:\n", data.toString("utf8"));
  });

  eagleAutoroute.on("exit", function(code) {
    if (code == "0") {
      // Process finish correctly
      try {
        // Get board, if it doesn't exist then routed board failed.
        fs.readFileSync("../../json_to_eagle_brd/ROUTED.brd", "utf8");
      } catch (err) {
        console.log(err.stack);
        res.status(500).send({ error: "Server error" });
        console.log("\n######\n###### END Autorouting PCB (Fail) \n######");
        return;
      }
      // Eagle autorouted correctly
      res.send({ message: "Success" });
      console.log("\n######\n###### END Autorouting PCB (Success) \n######");
    } else {
      // Process error
      res.status(500).send({ error: "Server error" });
      console.log("\n######\n###### END Autorouting PCB (Fail) \n######");
    }
  });
});

app.get("/api/generateGerber", function(req, res) {
  console.log("\n######\n###### Generating PCB Gerber \n######");
  // TODO kill any eagle process

  // Delete output files
  fs.emptyDirSync("../../json_to_eagle_brd/GERBER/");

  let spawn = require("child_process").spawn;
  let eagleGerber = spawn("../../eagle-9.4.2/eagle", [
    "-X",
    "-N",
    "-d",
    "CAMJOB",
    "-j",
    "../../json_to_eagle_brd/artik_2layer.cam",
    "../../json_to_eagle_brd/ROUTED.brd",
    "-o",
    "../../json_to_eagle_brd/GERBER/",
  ]);
  // Set timeout for eagle autoruter
  setTimeout(function() {
    // If process hasn't reported an exist status yet, kill it.
    if (eagleGerber.exitCode == null) {
      eagleGerber.stdin.pause();
      eagleGerber.kill();
      console.log("\n######\n###### Generating PCB Gerber (Timeout) \n######");
      return;
    }
  }, 10000); // 10 seconds

  eagleGerber.stderr.on("data", (data) => {
    // Data error
    console.log("\nDATA ERROR:\n", data.toString("utf8"));
  });

  eagleGerber.stdout.on("data", function(data) {
    console.log("\nDATA GOOD:\n", data.toString("utf8"));
  });

  eagleGerber.on("exit", function(code) {
    try {
      if (code == "0") {
        // Process finish correctly

        // Get board
        let board = fs.readFileSync(
          "../../json_to_eagle_brd/ROUTED.brd",
          "utf8"
        );

        // Get Gerber Files
        let routedGBL = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GBL",
          "utf8"
        );
        let routedGBO = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GBO",
          "utf8"
        );
        let routedGBP = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GBP",
          "utf8"
        );
        let routedGBS = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GBS",
          "utf8"
        );
        let routedGML = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GML",
          "utf8"
        );
        let routedGTL = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GTL",
          "utf8"
        );
        let routedGTO = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GTO",
          "utf8"
        );
        let routedGTP = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GTP",
          "utf8"
        );
        let routedGTS = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.GTS",
          "utf8"
        );
        let routedTXT = fs.readFileSync(
          "../../json_to_eagle_brd/GERBER/ROUTED.TXT",
          "utf8"
        );

        console.log("\n...SENDING GERBER FILES\n");
        res.send({
          message: [
            { filename: "appliancizer.brd", data: board, folder: "" },
            { filename: "routed.GBL", data: routedGBL, folder: "" },
            { filename: "routed.GBO", data: routedGBO, folder: "" },
            { filename: "routed.GBP", data: routedGBP, folder: "" },
            { filename: "routed.GBS", data: routedGBS, folder: "" },
            { filename: "routed.GML", data: routedGML, folder: "" },
            { filename: "routed.GTL", data: routedGTL, folder: "" },
            { filename: "routed.GTO", data: routedGTO, folder: "" },
            { filename: "routed.GTP", data: routedGTP, folder: "" },
            { filename: "routed.GTS", data: routedGTS, folder: "" },
            { filename: "routed.TXT", data: routedTXT, folder: "" },
          ],
        });
        // Eagle generated gerber files correctly
        console.log(
          "\n######\n###### END Generating PCB Gerber (Success) \n######"
        );
      } else {
        // Process error
        res.status(500).send({ error: "Server error" });
        console.log(
          "\n######\n###### END Generating PCB Gerber (Fail) \n######"
        );
      }
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: "Server error" });
      console.log("\n######\n###### END Generating PCB Gerber (Fail) \n######");
    }
  });
});
