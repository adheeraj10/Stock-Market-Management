import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
dotenv.config();

const dbConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    }
    : {
        host: "localhost",
        user: process.env.DB_USER || "postgres",
        port: process.env.DB_PORT || 5432,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    };

async function seedData() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log("Connected to PostgreSQL for seeding synthetic market data");

        // Get all scraped companies
        const companiesRes = await client.query('SELECT ticker_symbol, stock_price FROM companies');

        // For each company, generate 30 days of synthetic historical data
        for (const company of companiesRes.rows) {
            const symbol = company.ticker_symbol;
            const basePrice = parseFloat(company.stock_price) || (Math.random() * 100 + 50);

            const queries = [];
            let currentPrice = basePrice;

            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                // Random walk for historical prices
                const changePercent = (Math.random() - 0.5) * 0.05; // +/- 2.5% daily fluctuation
                currentPrice = currentPrice * (1 + changePercent);

                const open = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
                const close = currentPrice;
                const high = Math.max(open, close) * (1 + Math.random() * 0.01);
                const low = Math.min(open, close) * (1 - Math.random() * 0.01);
                const volume = Math.floor(Math.random() * 10000000) + 1000000;

                queries.push(`('${symbol}', '${dateStr}', ${open}, ${high}, ${low}, ${close}, ${volume})`);
            }

            if (queries.length > 0) {
                // Clear any old, potentially broken API data for this symbol
                await client.query(`DELETE FROM market_data WHERE symbol = $1`, [symbol]);

                // Insert new synthetic data
                const insertQuery = `
          INSERT INTO market_data (symbol, date, open, high, low, close, volume)
          VALUES ${queries.join(', ')}
        `;
                await client.query(insertQuery);
                console.log(`Seeded 30 days of data for ${symbol}`);
            }
        }
    } catch (err) {
        console.error("Error seeding synthetic data:", err);
    } finally {
        await client.end();
        console.log("Seeding complete. Connection closed.");
    }
}

seedData();
