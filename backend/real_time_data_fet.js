// const puppeteer = require('puppeteer');
// const { Client } = require('pg');
import pkg from "pg";
const { Client } = pkg;
import puppeteer from "puppeteer";
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

  console.log("Starting stock scraping...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-infobars",
    ]
  });

  const stockData = [];

  try {
    const page = await browser.newPage();
    // Block images and fonts to save bandwidth/memory
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Limit to top 20 stocks for now to prevent timeout/crash on free tier
    // We can increase this later if it's stable.
    const symbols = Object.entries(stockSymbols).slice(0, 20);

    for (const [symbol, exchange] of symbols) {
      try {
        const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
        // console.log(`Fetching ${symbol}...`); // Reduce log spam

        // Shorter timeout to fail fast
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

        const data = await page.evaluate(() => {
          const name = document.querySelector(".zzDege")?.textContent || "N/A";
          const price =
            document
              .querySelector(".YMlKec.fxKbKc")
              ?.textContent.replace(/[$,]/g, "") || "0";
          return { name, price };
        });

        if (data.name !== "N/A") {
          stockData.push({ symbol, exchange, ...data });
          console.log(`Scraped ${symbol}: ${data.price}`);
        }
      } catch (error) {
        console.error(`Skipped ${symbol}: ${error.message}`);
      }
    }

    // Process db update below...
  } catch (err) {
    console.error("Critical scraping error:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
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
  WITH existing_shares AS (
    SELECT total_shares 
    FROM companies 
    WHERE ticker_symbol = $2
  )
  INSERT INTO companies (company_name, ticker_symbol, stock_price, total_shares)
  VALUES (
    $1, 
    $2, 
    $3, 
    COALESCE((SELECT total_shares FROM existing_shares), $4)
  )
  ON CONFLICT (ticker_symbol) 
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
      console.log(`Inserted/Updated ${company_name} (${ticker_symbol})`);
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
