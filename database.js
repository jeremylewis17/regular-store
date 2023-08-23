const { Pool } = require('pg');

const pool = new Pool({
    //STILL NEED TO CONFIGURE MY DATABASE IN .ENV
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

module.exports = { pool };
