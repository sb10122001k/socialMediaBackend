const dotenv = require('dotenv')
const { Pool } = require('pg');

dotenv.config();
const pool = new Pool({
    connectionString: process.env.DBURL
});


module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    }
};
