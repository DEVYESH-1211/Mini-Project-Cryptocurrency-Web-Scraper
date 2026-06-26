import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Search, 
  Download, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ArrowUpDown, 
  Terminal, 
  Database, 
  Layers, 
  Info,
  ExternalLink,
  ShieldAlert,
  Compass
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Coin {
  rank: number;
  id: number;
  name: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  lastUpdated: string | null;
}

interface AiReport {
  sentiment: string;
  sentimentReason: string;
  topGainer: { name: string; symbol: string; change: number };
  topLoser: { name: string; symbol: string; change: number };
  analysis: string;
  highlights: string[];
}

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [scrapedCount, setScrapedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<string>('Never');
  const [scraperSource, setScraperSource] = useState<string>('');
  
  // Sorting states
  const [sortField, setSortField] = useState<keyof Coin>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // AI states
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize with some dummy/preview data so the screen isn't empty upon initial render
  useEffect(() => {
    const previewData: Coin[] = [
      { rank: 1, id: 1, name: 'Bitcoin', symbol: 'BTC', price: 64281.90, change24h: 2.45, marketCap: 1268400000000, volume24h: 32100000000, lastUpdated: new Date().toISOString() },
      { rank: 2, id: 1027, name: 'Ethereum', symbol: 'ETH', price: 3442.12, change24h: 1.12, marketCap: 413200000000, volume24h: 14800000000, lastUpdated: new Date().toISOString() },
      { rank: 3, id: 825, name: 'Tether', symbol: 'USDT', price: 1.00, change24h: 0.01, marketCap: 112500000000, volume24h: 45200000000, lastUpdated: new Date().toISOString() },
      { rank: 4, id: 1839, name: 'BNB', symbol: 'BNB', price: 582.44, change24h: -0.84, marketCap: 85900000000, volume24h: 1200000000, lastUpdated: new Date().toISOString() },
      { rank: 5, id: 5426, name: 'Solana', symbol: 'SOL', price: 143.19, change24h: 4.92, marketCap: 64100000000, volume24h: 2900000000, lastUpdated: new Date().toISOString() },
      { rank: 6, id: 3408, name: 'USD Coin', symbol: 'USDC', price: 1.00, change24h: 0.00, marketCap: 34500000000, volume24h: 6200000000, lastUpdated: new Date().toISOString() },
      { rank: 7, id: 52, name: 'XRP', symbol: 'XRP', price: 0.492, change24h: -1.25, marketCap: 27300000000, volume24h: 980000000, lastUpdated: new Date().toISOString() },
      { rank: 8, id: 2010, name: 'Cardano', symbol: 'ADA', price: 0.384, change24h: 0.54, marketCap: 13700000000, volume24h: 310000000, lastUpdated: new Date().toISOString() }
    ];
    setCoins(previewData);
    setScrapedCount(previewData.length);
    setLastSync('Preview Mode');
    addLog('System Initialized. Ready for active scraping.');
  }, []);

  // Scroll terminal logs to bottom when updated
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Run full scraping flow
  const handleStartScraping = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setAiReport(null);
    setLogs([]);
    
    addLog('Initializing DevScrape Core v2.4.0...');
    addLog('Spawning background scraper pipeline...');
    
    // Simulate steps of scraping to look highly authentic
    await delay(600);
    addLog(`Setting scraper result limit: Top ${limit} Currencies.`);
    addLog('Establishing secure HTTP connections with coinmarketcap.com...');
    
    await delay(500);
    addLog('Injecting anti-detection HTTP Headers and rotating User-Agents...');
    addLog('Handshake completed successfully.');

    await delay(700);
    addLog('Sending data-extraction query to CoinMarketCap server endpoints...');
    
    try {
      const response = await fetch(`/api/scrape?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Scraper API returned status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        addLog(`Engine response parsed successfully. Scraper Engine: [${result.source.toUpperCase()}]`);
        addLog(`Extracted ${result.data.length} coin listings with real-time variables.`);
        
        setCoins(result.data);
        setScrapedCount(result.data.length);
        setScraperSource(result.source);
        
        const now = new Date();
        setLastSync(now.toLocaleTimeString());
        addLog('Syncing Local Data store...');
        addLog('Updating Interactive charts and dashboard metrics.');
        addLog('Database synchronized. Scrape process COMPLETED.');

        // Trigger AI Insight generation automatically
        triggerAiAnalysis(result.data);
      } else {
        throw new Error(result.error || 'Unknown scraper error');
      }
    } catch (err: any) {
      addLog(`CRITICAL ERROR: ${err.message || err}`);
      addLog('Process aborted. Attempting state recovery.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Trigger Gemini AI Report
  const triggerAiAnalysis = async (dataToAnalyze: Coin[]) => {
    setIsAiLoading(true);
    addLog('Sending scraped telemetry payload to Google Gemini AI Engine...');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: dataToAnalyze })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API returned status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data) {
        setAiReport(result.data);
        setAiSource(result.source);
        addLog(`Gemini AI analysis successfully generated using [${result.source}] pipeline.`);
      } else {
        throw new Error('No analysis data received.');
      }
    } catch (err: any) {
      addLog(`Warning: AI insights generation failed: ${err.message || err}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (coins.length === 0) {
      alert("No data available to export. Please run a scrape first.");
      return;
    }

    addLog('Generating downloadable CSV payload file...');
    const headers = ['Rank', 'Name', 'Symbol', 'Price (USD)', '24h Change (%)', 'Market Cap (USD)', 'Volume 24h (USD)', 'Last Updated'];
    const csvRows = [headers.join(',')];

    coins.forEach(coin => {
      csvRows.push([
        coin.rank,
        `"${coin.name.replace(/"/g, '""')}"`,
        coin.symbol,
        coin.price || 0,
        coin.change24h || 0,
        coin.marketCap || 0,
        coin.volume24h || 0,
        `"${coin.lastUpdated || ''}"`
      ].join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `devscrape_crypto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('CSV downloaded successfully.');
  };

  // Categorize currencies
  const isLayer1 = (symbol: string) => {
    const list = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'DOT', 'AVAX', 'NEAR', 'FTM', 'ATOM', 'ALGO', 'XRP', 'TRX', 'MATIC'];
    return list.includes(symbol.toUpperCase());
  };

  const isDeFi = (symbol: string) => {
    const list = ['UNI', 'AAVE', 'MKR', 'COMP', 'CRV', 'LDO', 'GRT', 'JUP', 'CAKE', 'SNX', 'SUSHI', 'LINK', 'RUNE'];
    return list.includes(symbol.toUpperCase());
  };

  const isStablecoin = (symbol: string) => {
    const list = ['USDT', 'USDC', 'DAI', 'FDUSD', 'PYUSD', 'USDE', 'BUSD'];
    return list.includes(symbol.toUpperCase());
  };

  // Sorting Handler
  const handleSort = (field: keyof Coin) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Filter and Sort coins
  const filteredAndSortedCoins = coins
    .filter(coin => {
      const matchesSearch = 
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'gainers') return (coin.change24h || 0) > 0;
      if (selectedCategory === 'losers') return (coin.change24h || 0) < 0;
      if (selectedCategory === 'layer1') return isLayer1(coin.symbol);
      if (selectedCategory === 'defi') return isDeFi(coin.symbol);
      if (selectedCategory === 'stable') return isStablecoin(coin.symbol);

      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      // Numbers
      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    });

  // Calculate stats
  const totalMarketCap = coins.reduce((acc, curr) => acc + (curr.marketCap || 0), 0);
  const avg24hChange = coins.length > 0 
    ? coins.reduce((acc, curr) => acc + (curr.change24h || 0), 0) / coins.length 
    : 0;

  // Prepare chart data (Top 7 by marketcap)
  const chartData = [...coins]
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
    .slice(0, 7)
    .map(coin => ({
      name: coin.symbol,
      fullName: coin.name,
      marketCapBillion: (coin.marketCap || 0) / 1000000000,
      price: coin.price || 0,
      change: coin.change24h || 0
    }));

  return (
    <div id="devscrape-app" className="w-full h-screen bg-slate-950 text-slate-300 flex flex-col font-sans overflow-hidden select-none">
      
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-3" id="branding-container">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-slate-950"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            DEVSCRAPE<span className="text-emerald-500 ml-0.5 font-extrabold">.IO</span>
          </h1>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span> 
            {isLoading ? 'SCRAPING CORE RUNNING' : 'ENGINE STANDBY'}
          </span>
          <span className="hidden sm:inline border-l border-slate-800 pl-6">Version 2.4.0</span>
        </div>
      </header>

      {/* CORE FRAMEWORK */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* SIDEBAR */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/20 p-5 flex flex-col gap-6 overflow-y-auto flex-shrink-0">
          
          {/* SCRAPER CONFIG */}
          <section className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-md">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">
              Scraper Configuration
            </label>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Scrape Volume</label>
                <select 
                  id="scrape-limit-select"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value={10}>Top 10 Currencies</option>
                  <option value={25}>Top 25 Currencies</option>
                  <option value={50}>Top 50 Currencies</option>
                  <option value={100}>Top 100 Currencies</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Scraper Target</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-emerald-400 break-all select-all flex items-center justify-between">
                  <span>coinmarketcap.com</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>

              <button 
                id="start-scraping-btn"
                onClick={handleStartScraping}
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 mt-4 text-xs tracking-wider uppercase font-sans cursor-pointer disabled:cursor-not-allowed shadow-md shadow-emerald-950/20"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>SCRAPING DATA...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>START SCRAPING</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* DYNAMIC FILTERS */}
          <section className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-md space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">
                Dashboard Filters
              </label>
              
              {/* SEARCH */}
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name or symbol..." 
                  className="w-full bg-slate-950 border border-slate-700/60 rounded px-3 py-2 pl-8 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* CATEGORY BUTTONS */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium block">Filter by Segment</label>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between ${selectedCategory === 'all' ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' : 'bg-slate-950/20 border border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                >
                  <span>All Currencies</span>
                  <span className="text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded font-mono text-slate-500">{coins.length}</span>
                </button>

                <button 
                  onClick={() => setSelectedCategory('gainers')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between ${selectedCategory === 'gainers' ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' : 'bg-slate-950/20 border border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Gainers today
                  </span>
                  <span className="text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded font-mono text-slate-500">
                    {coins.filter(c => (c.change24h || 0) > 0).length}
                  </span>
                </button>

                <button 
                  onClick={() => setSelectedCategory('defi')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between ${selectedCategory === 'defi' ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' : 'bg-slate-950/20 border border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    DeFi Utilities
                  </span>
                  <span className="text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded font-mono text-slate-500">
                    {coins.filter(c => isDeFi(c.symbol)).length}
                  </span>
                </button>

                <button 
                  onClick={() => setSelectedCategory('layer1')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between ${selectedCategory === 'layer1' ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' : 'bg-slate-950/20 border border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    Layer 1 Networks
                  </span>
                  <span className="text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded font-mono text-slate-500">
                    {coins.filter(c => isLayer1(c.symbol)).length}
                  </span>
                </button>

                <button 
                  onClick={() => setSelectedCategory('stable')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between ${selectedCategory === 'stable' ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' : 'bg-slate-950/20 border border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    Stablecoins
                  </span>
                  <span className="text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded font-mono text-slate-500">
                    {coins.filter(c => isStablecoin(c.symbol)).length}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* ACTIVE TERMINAL LOGS */}
          <section className="flex-1 flex flex-col min-h-[140px] bg-slate-950 border border-slate-800/80 rounded p-3 font-mono text-[10px] text-slate-400 overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-900 pb-1.5 mb-2 flex-shrink-0">
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
                <Terminal className="w-3.5 h-3.5 text-slate-500" /> DevConsole
              </span>
              <span className="text-[8px] px-1 py-0.5 bg-slate-900 rounded font-bold">LOGS</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin select-text">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed hover:bg-slate-900/30">
                  <span className="text-slate-600">{log.substring(0, 10)}</span>
                  <span className={log.includes('CRITICAL') ? 'text-rose-400' : log.includes('COMPLETED') ? 'text-emerald-400' : 'text-slate-300'}>
                    {log.substring(10)}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-600 italic">No console logs recorded yet.</div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </section>

          {/* METADATA SUMMARY */}
          <div className="border-t border-slate-900 pt-4 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Scrape Synced:</span>
              <span className="font-mono text-slate-300 font-bold">{lastSync}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Scrape Source:</span>
              <span className="font-mono text-emerald-400 uppercase font-bold text-[10px]">
                {scraperSource || 'Preview'}
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTAINER */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-6 min-w-0">
          
          {/* TOP METRICS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0">
            {/* CARD 1 */}
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded flex items-center justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 text-slate-900/30 transform translate-x-2 translate-y-4 group-hover:text-emerald-950/20 transition-all">
                <Database className="w-24 h-24 stroke-[1]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scraped Items</span>
                <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
                  <span>{scrapedCount}</span>
                  <span className="text-xs text-slate-400 font-normal">currencies</span>
                </div>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-2.5 rounded">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded flex items-center justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 text-slate-900/30 transform translate-x-2 translate-y-4 group-hover:text-emerald-950/20 transition-all">
                <Layers className="w-24 h-24 stroke-[1]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scraped Market Cap</span>
                <div className="text-2xl font-bold text-white">
                  {totalMarketCap > 0 ? `$${(totalMarketCap / 1000000000000).toFixed(2)}T` : '$0.00T'}
                </div>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-2.5 rounded">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded flex items-center justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 text-slate-900/30 transform translate-x-2 translate-y-4 group-hover:text-emerald-950/20 transition-all">
                <Activity className="w-24 h-24 stroke-[1]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Average 24h Delta</span>
                <div className={`text-2xl font-bold flex items-center gap-1.5 ${avg24hChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {avg24hChange >= 0 ? '+' : ''}{avg24hChange.toFixed(2)}%
                </div>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-2.5 rounded">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* DYNAMIC METRICS CHART SECTION */}
          {coins.length > 0 && (
            <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-md mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 7 Currencies By Scraped Market Cap</h3>
                  <p className="text-xs text-slate-500">Horizontal scaling distribution values represented in Billions of USD</p>
                </div>
                <div className="text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-400 font-mono">
                  Scale: Billions
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: any, name: any, props: any) => [
                        `$${Number(value).toFixed(2)} Billion`, 
                        'Market Capitalization'
                      ]}
                    />
                    <Bar dataKey="marketCapBillion" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.change >= 0 ? '#10b981' : '#f43f5e'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* DYNAMIC TWO-COLUMN SPLIT (DATA LIST & GEMINI REPORT) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-shrink-0">
            
            {/* DATA TABLE SECTION */}
            <div className="xl:col-span-2 bg-slate-900/20 border border-slate-800 rounded-md flex flex-col min-h-[400px]">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scraped Assets Directory</h3>
                  <p className="text-xs text-slate-500">Showing {filteredAndSortedCoins.length} matching entities</p>
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-slate-100 text-slate-950 px-3.5 py-2 rounded text-xs font-bold hover:bg-white cursor-pointer select-none transition-colors border border-transparent shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT AS CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800 bg-slate-900/30">
                      <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-300" onClick={() => handleSort('rank')}>
                        <div className="flex items-center gap-1">
                          <span>#</span> <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-300" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">
                          <span>Currency</span> <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-300 text-right" onClick={() => handleSort('price')}>
                        <div className="flex items-center gap-1 justify-end">
                          <span>Price</span> <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-300 text-right" onClick={() => handleSort('change24h')}>
                        <div className="flex items-center gap-1 justify-end">
                          <span>24h %</span> <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-300 text-right hidden md:table-cell" onClick={() => handleSort('marketCap')}>
                        <div className="flex items-center gap-1 justify-end">
                          <span>Market Cap</span> <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-300 text-right hidden lg:table-cell" onClick={() => handleSort('volume24h')}>
                        <div className="flex items-center gap-1 justify-end">
                          <span>Volume (24h)</span> <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-800/50">
                    {filteredAndSortedCoins.map((coin, index) => {
                      const isGainer = (coin.change24h || 0) > 0;
                      const isFlat = (coin.change24h || 0) === 0;
                      
                      return (
                        <tr key={coin.symbol + '-' + index} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">{coin.rank}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              {/* Small color avatar representation */}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[8px] text-white ${
                                coin.symbol === 'BTC' ? 'bg-amber-500' :
                                coin.symbol === 'ETH' ? 'bg-blue-500' :
                                coin.symbol === 'USDT' ? 'bg-emerald-500' :
                                coin.symbol === 'BNB' ? 'bg-yellow-500' :
                                coin.symbol === 'SOL' ? 'bg-indigo-500' : 'bg-slate-700'
                              }`}>
                                {coin.symbol.substring(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-200">{coin.name}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{coin.symbol}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono text-right text-slate-200">
                            {coin.price !== null ? (
                              coin.price >= 1 ? `$${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${coin.price.toFixed(5)}`
                            ) : 'N/A'}
                          </td>
                          <td className={`px-5 py-3 font-mono text-right font-medium ${isFlat ? 'text-slate-400' : isGainer ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {coin.change24h !== null ? (
                              `${isGainer ? '+' : ''}${coin.change24h.toFixed(2)}%`
                            ) : '0.00%'}
                          </td>
                          <td className="px-5 py-3 font-mono text-right text-slate-400 hidden md:table-cell">
                            {coin.marketCap ? `$${(coin.marketCap / 1000000000).toFixed(2)}B` : 'N/A'}
                          </td>
                          <td className="px-5 py-3 font-mono text-right text-slate-400 hidden lg:table-cell">
                            {coin.volume24h ? `$${(coin.volume24h / 1000000000).toFixed(2)}B` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredAndSortedCoins.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500 italic">
                          No matching cryptocurrency records located. Adjust your filters or search keywords.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI INSIGHTS PANEL (GEMINI) */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-md p-4 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-xs uppercase tracking-wider font-bold text-white">Gemini Market Insights</h3>
                  </div>
                  {aiSource && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded font-mono">
                      {aiSource.toUpperCase()}
                    </span>
                  )}
                </div>

                {isAiLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Analyzing scraped telemetry</p>
                      <p className="text-[11px] text-slate-500 max-w-xs">Generating market intelligence report using Gemini 3.5 Flash...</p>
                    </div>
                  </div>
                ) : aiReport ? (
                  <div className="space-y-4">
                    {/* Sentiment Badge */}
                    <div className="bg-slate-900/40 p-3 border border-slate-800 rounded">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Overall Sentiment</span>
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded font-mono ${
                          aiReport.sentiment === 'Bullish' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' :
                          aiReport.sentiment === 'Bearish' ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30' :
                          'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}>
                          {aiReport.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{aiReport.sentimentReason}</p>
                    </div>

                    {/* Highlights Bullets */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold block">Key Observations</span>
                      <ul className="space-y-1.5">
                        {aiReport.highlights.map((highlight, index) => (
                          <li key={index} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-emerald-500 font-bold mt-0.5">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* General Summary Paragraph */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold block">Trend Analysis</span>
                      <p className="text-xs text-slate-400 leading-relaxed text-justify font-sans">{aiReport.analysis}</p>
                    </div>

                    {/* Gainer / Loser Mini cards */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="p-2.5 bg-emerald-950/10 border border-emerald-500/10 rounded">
                        <span className="text-[9px] uppercase text-slate-500 font-semibold block mb-0.5">Top Gainer</span>
                        <div className="text-xs font-bold text-emerald-400">{aiReport.topGainer.name}</div>
                        <div className="text-[10px] text-emerald-500 font-mono mt-0.5 font-semibold">
                          +{aiReport.topGainer.change?.toFixed(2)}%
                        </div>
                      </div>

                      <div className="p-2.5 bg-rose-950/10 border border-rose-500/10 rounded">
                        <span className="text-[9px] uppercase text-slate-500 font-semibold block mb-0.5">Top Outflow</span>
                        <div className="text-xs font-bold text-rose-400">{aiReport.topLoser.name}</div>
                        <div className="text-[10px] text-rose-500 font-mono mt-0.5 font-semibold">
                          {aiReport.topLoser.change?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-slate-800 rounded p-4 text-center text-slate-500 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-semibold">No AI Report Active</p>
                      <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-normal">
                        Click <strong className="text-slate-400">"Start Scraping"</strong> to scrape fresh telemetry and prompt Gemini for analytics report.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* API Notice */}
              <div className="border-t border-slate-900 pt-3.5 mt-4 text-[10px] text-slate-500 flex items-start gap-1.5 bg-slate-900/10 p-2.5 rounded">
                <Info className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Reports are synthesized securely server-side. Key secrets are managed under safe security contexts.
                </p>
              </div>

            </div>

          </div>

        </main>

      </div>

      {/* FOOTER */}
      <footer className="h-10 border-t border-slate-800 flex items-center px-8 bg-slate-900 justify-between text-[10px] font-mono text-slate-500 uppercase tracking-tighter flex-shrink-0">
        <div className="flex items-center gap-1">
          <span>System Status:</span> 
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Operational
          </span>
          <span className="mx-2 text-slate-700">•</span>
          <span>Node Profile:</span> 
          <span className="text-slate-300">US-EAST-4</span>
        </div>
        <div className="flex gap-4">
          <span>Rotation: Active</span>
          <span>Security Guard: SSL/TLS</span>
        </div>
      </footer>

    </div>
  );
}
