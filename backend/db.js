import Pool from "pg"

const pool = new Pool({
    user: 'localhost',
    host: 'localhost',
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: 5000,
});

module.exports = pool; 