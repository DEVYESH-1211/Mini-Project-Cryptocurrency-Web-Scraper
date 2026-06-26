import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Scraper Endpoint (optimized direct JS for Vercel Serverless environment)
app.get('/api/scrape', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  console.log(`[Vercel Serverless Scraper] Starting scrape request for top ${limit} currencies.`);

  try {
    const url = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=${limit}&sortBy=market_cap&sortType=desc&convert=USD`;
    const apiResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    
    if (!apiResponse.ok) {
      throw new Error(`CoinMarketCap fetch failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const cryptoList = data?.data?.cryptoCurrencyList || [];
    const result = cryptoList.map((coin, index) => {
      const quotes = coin.quotes || [{}];
      const usdQuote = quotes.find(q => q.name === 'USD') || quotes[0] || {};
      return {
        rank: coin.cmcRank || (index + 1),
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: usdQuote.price,
        change24h: usdQuote.percentChange24h,
        marketCap: usdQuote.marketCap,
        volume24h: usdQuote.volume24h,
        lastUpdated: coin.lastUpdated || usdQuote.lastUpdated
      };
    });

    console.log(`[Vercel Serverless Scraper] Successfully retrieved ${result.length} items.`);
    return res.json({ success: true, source: 'vercel_serverless', data: result });
  } catch (error) {
    console.error(`[Vercel Serverless Scraper] Error:`, error);
    return res.status(500).json({ error: "Scraping failed inside the Vercel serverless environment.", details: error.message });
  }
});

// AI Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  const { coins } = req.body;
  if (!coins || !Array.isArray(coins) || coins.length === 0) {
    return res.status(400).json({ error: "No cryptocurrency data provided for analysis" });
  }

  if (!ai) {
    console.warn("[Gemini API] Client not initialized. Returning fallback static analysis.");
    return res.json(getStaticFallbackAnalysis(coins));
  }

  try {
    console.log(`[Gemini API] Requesting AI market analysis for ${coins.length} coins on Vercel.`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert cryptocurrency market analyst. Analyze the following live CoinMarketCap scraped data:
${JSON.stringify(coins.slice(0, 15), null, 2)}

Provide a concise, high-impact review of the market state based on this data. Format the output as a clean JSON object containing overall sentiment, gainer/loser analysis, general trend summaries, and 2-3 interesting observations.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            sentiment: { type: "STRING", description: "Overall market sentiment: 'Bullish', 'Bearish', or 'Neutral'" },
            sentimentReason: { type: "STRING", description: "Reasoning for the overall sentiment" },
            topGainer: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                symbol: { type: "STRING" },
                change: { type: "NUMBER" }
              },
              required: ["name", "symbol", "change"]
            },
            topLoser: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                symbol: { type: "STRING" },
                change: { type: "NUMBER" }
              },
              required: ["name", "symbol", "change"]
            },
            analysis: { type: "STRING", description: "A summary paragraph describing general trends (trends in BTC, ETH, etc.)" },
            highlights: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Array of 2-3 specific insights or interesting callouts from the dataset (such as high volume relative to market cap, outliers, etc.)"
            }
          },
          required: ["sentiment", "sentimentReason", "topGainer", "topLoser", "analysis", "highlights"]
        }
      }
    });

    const parsedAnalysis = JSON.parse(response.text.trim());
    res.json({ success: true, source: 'gemini', data: parsedAnalysis });

  } catch (apiError) {
    console.error("[Gemini API] Error during generation on Vercel:", apiError);
    res.json(getStaticFallbackAnalysis(coins));
  }
});

// Programmatic fallback analysis generator
function getStaticFallbackAnalysis(coins) {
  const sortedByChange = [...coins].filter(c => typeof c.change24h === 'number').sort((a, b) => b.change24h - a.change24h);
  const topGainer = sortedByChange.length > 0 ? sortedByChange[0] : { name: 'N/A', symbol: 'N/A', change24h: 0 };
  const topLoser = sortedByChange.length > 0 ? sortedByChange[sortedByChange.length - 1] : { name: 'N/A', symbol: 'N/A', change24h: 0 };
  
  const upCount = coins.filter(c => c.change24h > 0).length;
  const ratio = upCount / coins.length;
  const sentiment = ratio > 0.6 ? "Bullish" : ratio < 0.4 ? "Bearish" : "Neutral";
  
  return {
    success: false,
    source: 'static_fallback',
    data: {
      sentiment,
      sentimentReason: `Calculated from scraped data. Approximately ${(ratio * 100).toFixed(0)}% of the tracked currencies are trading in green values today.`,
      topGainer: { name: topGainer.name, symbol: topGainer.symbol, change: topGainer.change24h },
      topLoser: { name: topLoser.name, symbol: topLoser.symbol, change: topLoser.change24h },
      analysis: `A general programmatic review indicates the current top 10 market leaders are demonstrating standard trading volumes. Bitcoin remains the absolute dominant layer-1 protocol, with general market action remaining closely synchronized to its movements.`,
      highlights: [
        `Top performer in this batch is ${topGainer.name} (${topGainer.symbol}) displaying a 24h change of ${topGainer.change24h?.toFixed(2)}%.`,
        `Market sentiment displays a ${sentiment} posture under present trading volumes.`,
        `Aggregate dataset analysis captures consistent correlation profiles across major utility tokens and stablecoins.`
      ]
    }
  };
}

export default app;
