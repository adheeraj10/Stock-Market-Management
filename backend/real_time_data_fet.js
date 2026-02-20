import pkg from "pg";
const { Client } = pkg;
import * as cheerio from "cheerio";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
// PostgreSQL configuration
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
console.log(process.env.DATABASE);
// Function to get random number for total shares
// Utility function to generate random shares
// function getRandomShares(min, max) {
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

// Named function for scraping and storing stock data
async function scrapeAndStoreStockData() {
  // List of stock symbols you want to scrape
  const stockSymbols = {
    AAPL: "NASDAQ",
    MSFT: "NASDAQ",
    GOOGL: "NASDAQ",
    AMZN: "NASDAQ",
    TSLA: "NASDAQ",
    "BRK.B": "NYSE",
    META: "NASDAQ",
    NVDA: "NASDAQ",
    JPM: "NYSE",
    JNJ: "NYSE",
    V: "NYSE",
    PG: "NYSE",
    UNH: "NYSE",
    HD: "NYSE",
    MA: "NYSE",
    XOM: "NYSE",
    KO: "NYSE",
    PFE: "NYSE",
    PEP: "NASDAQ",
    CSCO: "NASDAQ",
    MRK: "NYSE",
    ABT: "NYSE",
    CMCSA: "NASDAQ",
    AVGO: "NASDAQ",
    ADBE: "NASDAQ",
    NFLX: "NASDAQ",
    INTC: "NASDAQ",
    VZ: "NYSE",
    DIS: "NYSE",
    WMT: "NYSE",
    TMO: "NYSE",
    NKE: "NYSE",
    MCD: "NYSE",
    BAC: "NYSE",
    CRM: "NYSE",
    QCOM: "NASDAQ",
    ACN: "NYSE",
    COST: "NASDAQ",
    TXN: "NASDAQ",
    WFC: "NYSE",
    T: "NYSE",
    LIN: "NYSE",
    MDT: "NYSE",
    AMGN: "NASDAQ",
    HON: "NASDAQ",
    IBM: "NYSE",
    NEE: "NYSE",
    C: "NYSE",
    BA: "NYSE",
    PM: "NYSE",
    UNP: "NYSE",
    RTX: "NYSE",
    SCHW: "NYSE",
    LOW: "NYSE",
    ORCL: "NYSE",
    INTU: "NASDAQ",
    SPGI: "NYSE",
    AMAT: "NASDAQ",
    GS: "NYSE",
    MS: "NYSE",
    BMY: "NYSE",
    DE: "NYSE",
    PYPL: "NASDAQ",
    CAT: "NYSE",
    PLD: "NYSE",
    MMM: "NYSE",
    MO: "NYSE",
    AXP: "NYSE",
    DUK: "NYSE",
    CL: "NYSE",
    CCI: "NYSE",
    ADP: "NASDAQ",
    TGT: "NYSE",
    CVX: "NYSE",
    APD: "NYSE",
    PGR: "NYSE",
    SO: "NYSE",
    COP: "NYSE",
    NOW: "NYSE",
    FIS: "NYSE",
    HUM: "NYSE",
    BKNG: "NASDAQ",
    BLK: "NYSE",
    ISRG: "NASDAQ",
    ELV: "NYSE",
    USB: "NYSE",
    EQIX: "NASDAQ",
    LRCX: "NASDAQ",
    REGN: "NASDAQ",
    ZTS: "NYSE",
    ADI: "NASDAQ",
    GE: "NYSE",
    LMT: "NYSE",
    KMB: "NYSE",
    NSC: "NYSE",
    GD: "NYSE",
    ITW: "NYSE",
    NOC: "NYSE",
    OXY: "NYSE",
    ECL: "NYSE",
  };

  console.log("Starting lightweight stock scraping (Axios + Cheerio)...");

  const stockData = [];

  try {
    // Limit to top 20 stocks for now to prevent timeout/crash on free tier
    const symbols = Object.entries(stockSymbols).slice(0, 20);

    for (const [symbol, exchange] of symbols) {
      try {
        const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;

        // Fetch static HTML
        const { data } = await axios.get(url, {
          headers: {
            // Act like a standard browser to prevent 403 blocks
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          timeout: 10000
        });

        const $ = cheerio.load(data);

        const name = $(".zzDege").text() || "N/A";
        const priceText = $(".YMlKec.fxKbKc").text();
        const price = priceText ? priceText.replace(/[$,]/g, "") : "0";

        if (name !== "N/A") {
          stockData.push({ symbol, exchange, name, price });
          console.log(`Scraped ${symbol}: ${price}`);
        }
      } catch (error) {
        console.error(`Skipped ${symbol}: ${error.message}`);
      }
    }
  } catch (err) {
    console.error("Critical scraping error:", err);
  }

  const client = new Client(dbConfig);
  await client.connect();

  try {
    for (const stock of stockData) {
      const company_name = stock.name;
      const ticker_symbol = stock.symbol;
      let stock_price = parseFloat(stock.price);
      // const total_shares = getRandomShares(1000, 10000);

      const query = `
  WITH existing_shares AS(
          SELECT total_shares 
    FROM companies 
    WHERE ticker_symbol = $2
        )
  INSERT INTO companies(company_name, ticker_symbol, stock_price, total_shares)
        VALUES(
          $1,
          $2,
          $3,
          COALESCE((SELECT total_shares FROM existing_shares), $4)
  )
  ON CONFLICT(ticker_symbol) 
  DO UPDATE SET
        company_name = EXCLUDED.company_name,
          stock_price = EXCLUDED.stock_price;
        `;

      const defaultTotalShares = 5000; // or whatever default value you want for new companies

      await client.query(query, [
        company_name,
        ticker_symbol,
        stock_price,
        defaultTotalShares, // This will only be used for new insertions, not updates
      ]);
      console.log(`Inserted / Updated ${company_name} (${ticker_symbol})`);
    }
  } catch (error) {
    console.error("Database operation failed:", error.message);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

// Export the named function for reuse in other files
export default scrapeAndStoreStockData;
