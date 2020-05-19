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
      : ".env.development",
});

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
  projectname VARCHAR(30) NOT NULL UNIQUE CHECK (LENGTH(projectname) > 0),
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
      `INSERT INTO projects (user_id, username, projectname, project, updated_date) 
        VALUES (1, 'jerom', 'pikachu', '{"project": "Hello User World 1"}', NOW());`
    );
    await pool.query(
      `INSERT INTO projects (user_id, username, projectname, project, updated_date) 
        VALUES (1, 'jerom', 'pidgoto', '{"project": "Hello User World 2"}', NOW());
      `
    );
    await pool.query(
      `INSERT INTO projects (user_id, username, projectname, project, updated_date)
       VALUES (2, 'admin', 'charmander', '{"project": "Hello Admin World"}', NOW());`
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
  resetTablesWithData,
};
