const db = require('../db/database');

const createPostTable = async () => {
    const tableName = 'post';

    try {
        const query = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id SERIAL PRIMARY KEY,
                images VARCHAR(500)[] NOT NULL,
                postedBy INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                likedBy INTEGER[],
                comments VARCHAR (500)[] ,
                commentUserIds INTEGER[]            
            )
        `;

        await db.query(query);
        console.log(`Table "${tableName}" created successfully`);
    } catch (error) {
        throw error;
    }
};

module.exports = { createPostTable };
