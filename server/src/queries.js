/*
Start psql server first with:
$ sudo service postgresql start
$ psql -d api -U jgarzagudb 
pass: password
api=> select * from users;
*/
//
// Requires
//
const Pool = require("pg").Pool;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config({
  // Load envarioment variables for development or production
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

//
// URLs & PORTS configurations
//
const SERVER_PORT = 3000;
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

//
// Connect to database
//
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool.on("connect", () => {
  console.log("## Connected to the database ##");
});

//
// Queries
//
const userLoginRequest = async (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  console.log("-- Login Request:", username);

  try {
    // Find user in database
    const userResult = await pool.query(
      `SELECT id, username, password, security_level FROM users WHERE username = $1`,
      [username]
    );
    if (userResult.rows.length === 0) {
      // User not found
      response.status(401).send({ error: "Invalid username or password" });
      console.log("-- Login Request failed for:", username);
    } else {
      // User found, check password
      const match = await bcrypt.compare(password, userResult.rows[0].password);
      if (match) {
        // Create a session token for user
        const auth = {
          id: userResult.rows[0].id,
          username: userResult.rows[0].username,
          security_level: userResult.rows[0].security_level,
        };
        const accessToken = jwt.sign(auth, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        // Send token back
        response.status(200).send({ token: accessToken });
        console.log("-- Login Succesful for:", username);
      } else {
        response.status(401).send({ error: "Invalid username or password" });
        console.log("-- Login Request failed for:", username);
      }
    }
  } catch (err) {
    console.log(err.stack);
    response.status(500).send({ error: "Database error" });
  }
};

const authenticateUser = (request, response) => {
  const token = request.body.token;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return response.sendStatus(403);
    response.status(200).send(user);
  });
};

const userRegisterRequest = async (request, response) => {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  console.log("-- Register Request:", username, email);

  try {
    // Check if user already exists
    const userExists = await pool.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );
    if (userExists.rows.length != 0) {
      // user with the same name exists
      console.log(
        "-- Register Request Fail, username exists:",
        username,
        email
      );
      response.status(409).send({ error: "Username already exists" });
      return;
    }
    // Check if email already exists
    const emailExists = await pool.query(
      `SELECT email FROM users WHERE email = $1`,
      [email]
    );
    if (emailExists.rows.length != 0) {
      // user with the same name exists
      console.log("-- Register Request Fail, email  exists:", username, email);
      response.status(409).send({ error: "Email already exists" });
      return;
    }
    // Hash user password
    const salt = await bcrypt.genSalt();
    const hashPassowrd = await bcrypt.hash(password, salt);
    console.log("HASH Password:", hashPassowrd);
    // Register user
    await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3);`,
      [username, email, hashPassowrd]
    );
    // Return a token for now TODO: should return email link
    const results = await pool.query(
      "SELECT id, username, security_level FROM users WHERE username = $1",
      [username]
    );
    const auth = {
      id: results.rows[0].id,
      username: results.rows[0].username,
      security_level: results.rows[0].security_level,
    };
    const accessToken = jwt.sign(auth, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    response.status(200).send({ token: accessToken });
    console.log("-- User Registered", username, email);
  } catch (err) {
    console.log(err.stack);
    response.status(500).send({ error: "Database error" });
  }
};

const userProjects = async (request, response) => {
  try {
    const user_id = parseInt(request.params.id);
    console.log("-- Trying to get projects of userID", user_id);
    // Register user
    const projects = await pool.query(
      `SELECT projectname, projectimage, updated_date, created_date FROM projects WHERE user_id = $1;`,
      [user_id]
    );
    response.status(200).send({ result: projects.rows });
  } catch (err) {
    console.log(err.stack);
    response.status(500).send({ error: "Database error" });
  }
};

const updateProject = async (request, response) => {
  try {
    const username = request.body.username;
    const user_projectname = request.body.projectname;
    const user_project = JSON.stringify(request.body.project);
    console.log("-- Trying to update project of user", username);
    // Update user project
    const result = await pool.query(
      `UPDATE projects SET project = $1,
      updated_date = NOW() WHERE username = $2 AND projectname = $3;`,
      [user_project, username, user_projectname]
    );
    if (result.rowCount != 1) {
      response.status(500).send({ error: "Username or project not found" });
    } else {
      response.status(200).send({ result: "OK" });
    }
  } catch (err) {
    console.log(err.stack);
    response.status(500).send({ error: "Database error" });
  }
};

const createProject = async (request, response) => {
  try {
    const user_id = request.body.id;
    const username = request.body.username;
    const user_projectname = request.body.projectname;
    const user_project = JSON.stringify(request.body.project);
    // Create project
    await pool.query(
      `INSERT INTO projects (user_id, username, projectname, project, updated_date)
      VALUES ($1, $2, $3, $4, NOW());`,
      [user_id, username, user_projectname, user_project]
    );
    response.status(200).send({ result: "OK" });
  } catch (err) {
    console.log(err.stack);
    response.status(500).send({ error: "Database error" });
  }
};

const getProject = async (request, response) => {
  try {
    const username = request.body.username;
    const user_projectname = request.body.projectname;
    console.log("-- Trying to get single project of username", username);
    // Register user
    const project = await pool.query(
      `SELECT project FROM projects WHERE username = $1 AND projectname = $2;`,
      [username, user_projectname]
    );
    response.status(200).send({ result: project.rows });
  } catch (err) {
    console.log(err.stack);
    response.status(500).send({ error: "Database error" });
  }
};

//
// Hardware Queries
//

// Download files (GET, /download/{filename})
const downloadFile = (req, res) => {
  var file = req.params.file;
  var fileLocation = path.join("./files", file);
  console.log(fileLocation);
  res.download(fileLocation, file);
};

const amalgamFiles = (req, res) => {
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
};

// Generate appliancizer web page and save project to postgresql
const generateWebPage = async (req, res) => {
  console.log("\n USER ID: ", req.body.userId);
  console.log("\n USER NAME: ", req.body.userName);
  console.log("\n PROJECT NAME: ", req.body.projectName);
  console.log("\n PROJECT IMAGE: ", req.body.projectImage);
  console.log("\n PROJECT DATA: ", req.body.projectData);
  console.log("\n USER HTML: ", req.body.htmlDoc);
  console.log("\n USER CSS: ", req.body.cssDoc);
  q;

  const userId = req.body.userId;
  const userName = req.body.userName;
  const projectName = req.body.projectName;
  const projectImage = req.body.projectImage;
  const projectData = req.body.projectData;

  // Update project in database
  try {
    // Update user project if already exists
    const result = await pool.query(
      `UPDATE projects SET project = '${projectData}', projectimage = decode('${projectImage}','base64'),
        updated_date = NOW() WHERE username = '${userName}' AND projectname = '${projectName}';`
    );
    if (result.rowCount != 1) {
      // If not found then create project
      await pool.query(
        `INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date) 
        VALUES (${userId}, '${userName}', '${projectName}', decode('${projectImage}','base64'),
        '${projectData}', NOW());`
      );
    }
  } catch (err) {
    console.log(err.stack);
    res.status(500).send({ error: "Database error" });
  }

  // Generate appliancizer web app
  try {
    // Create path if it doesn't exists
    const appDir = `../${PUBLIC_PATH}/apps/${userName}/${projectName}`;
    if (!fs.existsSync(appDir)) {
      console.log("Creating Path");
      fs.mkdir(appDir, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }
    // Create index.html file
    fs.writeFileSync(
      `../${PUBLIC_PATH}/apps/${userName}/${projectName}/index.html`,
      req.body.htmlDoc
    );

    // Create hardware.css file
    fs.writeFileSync(
      `../${PUBLIC_PATH}/apps/${userName}/${projectName}/hardware.css`,
      req.body.cssDoc
    );

    // Copy amalgamNative folder to the user folder
    fs.copySync(
      `../${PUBLIC_PATH}/amalgamNative`,
      `../${PUBLIC_PATH}/apps/${userName}/${projectName}/amalgam`
    );

    // If success send the user a link back
    if (process.env.NODE_ENV === "production") {
      res.send({
        link: `${WEB_URL}/apps/${userName}/${projectName}`,
      });
    } else {
      res.send({
        link: `${WEB_URL}:${LOCALHOST_PORT}/apps/${userName}/${projectName}`,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Server error: " + err,
    });
  }
};

// Generate PCB
const generatePCB = (req, res) => {
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
};

const autoroutePCB = (req, res) => {
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
};

const generateGerber = (req, res) => {
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
};

module.exports = {
  userLoginRequest,
  userRegisterRequest,
  authenticateUser,
  userProjects,
  getProject,
  updateProject,
  createProject,
  /// Appliancizer core
  downloadFile,
  amalgamFiles,
  generateWebPage,
  generatePCB,
  autoroutePCB,
  generateGerber,
};
