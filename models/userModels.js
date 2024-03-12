const db = require('../db/database');

const createUserTable = async () => {
    const tableName = 'users';

    try {
        const query = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                profile VARCHAR (500) ,
                followers_ids  INTEGER[]  ,
                following_ids INTEGER[]        
            )
        `;

        await db.query(query);
        console.log(`Table "${tableName}" created successfully`);
    } catch (error) {
        throw error;
    }
};



module.exports = { createUserTable };
