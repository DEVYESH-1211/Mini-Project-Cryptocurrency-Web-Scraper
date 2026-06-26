import sys
import json
import urllib.request
import argparse

def main():
    parser = argparse.ArgumentParser(description="DevScrape CoinMarketCap Python Scraper")
    parser.add_argument('--limit', type=int, default=100, help='Number of currencies to scrape')
    args = parser.parse_args()
    
    # CoinMarketCap data-api endpoint for live listings
    url = f"https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit={args.limit}&sortBy=market_cap&sortType=desc&convert=USD"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            raw_data = response.read().decode('utf-8')
            data = json.loads(raw_data)
            
            crypto_list = data.get('data', {}).get('cryptoCurrencyList', [])
            result = []
            
            for index, coin in enumerate(crypto_list):
                quotes = coin.get('quotes', [{}])
                usd_quote = {}
                for q in quotes:
                    if q.get('name') == 'USD':
                        usd_quote = q
                        break
                if not usd_quote and quotes:
                    usd_quote = quotes[0]
                
                result.append({
                    'rank': coin.get('cmcRank') or (index + 1),
                    'id': coin.get('id'),
                    'name': coin.get('name'),
                    'symbol': coin.get('symbol'),
                    'price': usd_quote.get('price'),
                    'change24h': usd_quote.get('percentChange24h'),
                    'marketCap': usd_quote.get('marketCap'),
                    'volume24h': usd_quote.get('volume24h'),
                    'lastUpdated': coin.get('lastUpdated') or usd_quote.get('lastUpdated')
                })
            
            print(json.dumps({'success': True, 'data': result}))
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()
