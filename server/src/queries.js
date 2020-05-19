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
require("dotenv").config({
  // Load envarioment variables for development or production
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

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
      `SELECT project FROM projects WHERE user_id = $1;`,
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

module.exports = {
  userLoginRequest,
  userRegisterRequest,
  authenticateUser,
  userProjects,
  getProject,
  updateProject,
  createProject,
};
