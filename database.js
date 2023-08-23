const { Pool } = require('pg');

const pool = new Pool({
    //STILL NEED TO CONFIGURE MY DATABASE HERE
    user: 'your_username',
    host: 'your_host',
    database: 'your_database',
    password: 'your_password',
    port: 5432
});

module.exports = { pool };
