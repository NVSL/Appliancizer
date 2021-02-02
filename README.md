# Appliancizer

TODO: Explain

# Running Appliancizer

## Client

## Project setup
```
npm install
```

### Run client (Project will run in port 8088)
```
npm run serve
```

## Server

### Install Swoop and json_to_eagle_brd

1. Install python3 and pip
```
supd apt-get update
sudo apt-get install python3 
sudo apt-get install python3-pip
```

2. Install Swoop
```
git clone https://github.com/NVSL/Swoop.git
pip3 install -r Swoop/requirements.txt
nano Swoop/Swoop/DRU.py // Fix bug https://github.com/NVSL/Swoop/issues/15
pip3 install ./Swoop
```

3. Install json_to_eagle_brd
```
git clone https://github.com/djmerrill/json_to_eagle_brd.git
pip3 install docopt==0.6.2
// Change any xml to version 9.2.2
```

### Install EAGLE (third-pary application) Linux verision



### Run Database Service
```bash
# If not installed run
sudo apt-get install postgresql
# Start postgresql and create role
sudo service postgresql start
create role jgarzagudb with login createdb encrypted password 'password';
alter user jgarzagudb with superuser;
exit
psql -d postgres -U jgarzagudb
CREATE DATABASE api;
\list
```

### Server setup
```
cd server
npm install
```

### Run server (runs on port 8081)

Developmet
```
cd server
npm run dev
```

Production (will run with pm2)
```
npm install -g pm2
cd server
npm run prod
```


