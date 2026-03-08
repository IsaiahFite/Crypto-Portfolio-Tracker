/**
 * Fetches current prices for all assets in the portfolio.
 * Returns an object keyed by asset ID: { [assetId]: { usd: number } }
 */
export async function fetchAllPrices(accounts) {
  let cryptoData = {}
  let stockData = {}

  const cryptoAccounts = accounts.filter(acc => acc.type === 'crypto')
  if (cryptoAccounts.length > 0) {
    const cryptoIds = [...new Set(cryptoAccounts.map(acc => acc.asset))].join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices')
    }
    cryptoData = await response.json()
  }

  const stockAccounts = accounts.filter(acc => acc.type === 'stock')
  const uniqueStockSymbols = [...new Set(stockAccounts.map(acc => acc.asset))]

  for (const symbol of uniqueStockSymbols) {
    try {
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        )}`
      )
      const proxyData = await response.json()
      const data = JSON.parse(proxyData.contents)

      if (data.chart && data.chart.result && data.chart.result[0]) {
        stockData[symbol] = { usd: data.chart.result[0].meta.regularMarketPrice }
      } else {
        stockData[symbol] = { usd: 0 }
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err)
      stockData[symbol] = { usd: 0 }
    }
  }

  return { ...cryptoData, ...stockData }
}
