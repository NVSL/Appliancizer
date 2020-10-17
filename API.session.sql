-- 
-- User Table
-- 
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) NOT NULL UNIQUE CHECK (LENGTH(username) > 0),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (LENGTH(email) > 0),
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 8),
  security_level VARCHAR(20) NOT NULL DEFAULT 'user',
  created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password) VALUES ('lal', 'jerobey@example.com',
 'asdfasdf');

SELECT * FROM users;

-- TODO: Create a tentative user that has a registration link and 
-- expiration date, when the user gets register it should get
-- added to users

--
-- Projects Table 
--
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(25) NOT NULL,
  projectname VARCHAR(25) NOT NULL UNIQUE  CHECK (LENGTH(projectname) > 0),
  projectimage BYTEA,
  project JSONB DEFAULT NULL,
  updated_date TIMESTAMPTZ NOT NULL,
  created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) -- Foregin key enforces that the id must exists in users
);
-- weblink can be constructed with /username/projectname

INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date) 
  VALUES (1, 'jerom','pikachu', 
  lo_import('/mnt/c/Users/jorge/Documents/Github/Applianzer/server/demoImages/demo1.png'),
  '{"project": "Hello User World 1"}', NOW());
INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date) 
  VALUES (1, 'jerom','bulbasy2',
  pg_read_binary_file('demo1.png'),
  '{"project": "Hello User World 2"}', NOW());
INSERT INTO projects (user_id, username, projectname, project, updated_date) 
  VALUES (2, 'admin', 'pidgoto','{"project": "Hello Admin World"}', NOW());

INSERT INTO projects (user_id, username, projectname, project, updated_date) VALUES (3, 'admin', 'charmander','{"project": "Hello Admin World"}', NOW());

SELECT * FROM projects;

SELECT project FROM projects WHERE user_id = 1;

---
--- JOINS
---
SELECT users.username, projects.project
FROM users
INNER JOIN projects ON users.id=projects.user_id;

-- 
-- Update Project
--
UPDATE projects SET project = '{"project": "Updated3"}', updated_date = NOW() WHERE username = 'jerom' AND projectname = 'pidgoto' 

-- Get Project / project exists
SELECT project FROM projects WHERE username = 'jerom' AND projectname = 'pidgoto'

SELECT security_level FROM users WHERE id = $1;

-- Using BYTEA requires pg_read_binary_file and moving the files to
-- api=# show data_directory;
-- else you get a error: ERROR:  absolute path not allowed
-- INSERT INTO projects (user_id, username, projectname, projectimage, project, updated_date) 
--   VALUES (1, 'jerom','bulbasy2',
--   pg_read_binary_file('/mnt/c/Users/jorge/Documents/Github/Applianzer/server/demoImages/demo1.png'),
--   '{"project": "Hello User World 2"}', NOW());