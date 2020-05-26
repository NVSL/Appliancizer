// EXPRESS POSTGRSQL
/*
Start psql server first with:
$ sudo service postgresql start
$ psql -d api -U jgarzagudb 
pass: password
api=> select * from users;
*/
// npm start
// npm install --save (module)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

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

// JSON query test
app.get("/api/status", (req, res) => {
  res.send({
    message: "Server Running Fine :D",
  });
});

//
// DATABASE TABLE QUERIES
//
const db = require("./manageTables");
//db.resetTableUsers();
db.resetTablesWithData();

//
// DATABASE REST QUERIES
//
const query = require("./queries");
app.post("/api/userLoginRequest", query.userLoginRequest);
app.post("/api/userRegisterRequest", query.userRegisterRequest);
app.post("/api/authenticateUser", query.authenticateUser);
app.get("/api/projects/:id", query.userProjects);
app.post("/api/getProject", query.getProject);
app.post("/api/updateProject", query.updateProject);
app.post("/api/createProject", query.createProject);

// ####
// In Production QUERIES
// ####

app.get("/api/download/:file(*)", query.downloadFile);
app.get("/api/amalgamFiles", query.amalgamFiles);
app.post("/api/generateWebPage", query.generateWebPage);
app.post("/api/generatePCB", query.generatePCB);
app.get("/api/autoroutePCB", query.autoroutePCB);
app.get("/api/generateGerber", query.generateGerber);

// // Get FILE (will download as (file.zip))
// app.get("/api/file", (req, res) => {
//   res.sendFile(__dirname + "/lol.zip");
// });

// // Get FILE (will download as (:name.zip))
// app.get("/api/file/:name", (req, res, next) => {
//   var fileName = req.params.name;
//   res.sendFile(__dirname + "/" + fileName, function(err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });

// // Upload Files
// app.post("/api/upload", function(req, res) {
//   if (Object.keys(req.files).length == 0) {
//     return res.status(400).send("No files were uploaded.");
//   }
//   console.log("Files to Upload:", req.files);
//   let userFile = req.files.file;

//   // Use the mv() method to place the file somewhere on your server
//   userFile.mv(__dirname + "/uploads/" + userFile.name, function(err) {
//     if (err) return res.status(500).send(err);
//     res.send("File uploaded!");
//   });
// });
// // TEST FILE UPLOAD:
// /*
// <html>
//   <body>
//     <form ref='uploadForm'
//       id='uploadForm'
//       action='http://localhost:8081/upload'
//       method='post'
//       encType="multipart/form-data">
//         <input type="file" name="file" />
//         <input type='submit' value='Upload!' />
//     </form>
//   </body>
// </html>
// */

// // Authenticate user
// app.post("/api/register", function(req, res) {
//   res.send({
//     message: `Hello ${req.body.email}! your user was registered!`,
//   });
// });
