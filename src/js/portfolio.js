import { supportedCryptos, supportedStocks } from './constants'

export function getAssetSymbol(assetId, type) {
  if (type === 'crypto') {
    return supportedCryptos.find(c => c.id === assetId)?.symbol || assetId.toUpperCase()
  }
  return assetId
}

export function getAssetName(assetId, type) {
  if (type === 'crypto') {
    return supportedCryptos.find(c => c.id === assetId)?.name || assetId
  }
  return supportedStocks.find(s => s.symbol === assetId)?.name || assetId
}

export function calculatePortfolioTotal(assets, prices, portfolio) {
  return assets
    .filter(a => a.portfolio === portfolio)
    .reduce((total, a) => {
      const price = prices[a.assetId]?.usd || 0
      return total + a.amount * price
    }, 0)
}

export function calculateGainLoss(amount, currentPrice, purchasePrice) {
  const value = amount * currentPrice
  if (!purchasePrice) {
    return { value, totalCost: null, gainLoss: null, gainLossPercent: null }
  }
  const totalCost = amount * purchasePrice
  const gainLoss = value - totalCost
  const gainLossPercent = ((value - totalCost) / totalCost) * 100
  return { value, totalCost, gainLoss, gainLossPercent }
}

/**
 * Generates a CSV string from portfolio data. Does not trigger a download.
 * The caller is responsible for writing the string to a file / blob.
 */
export function generateCSV(assets, prices) {
  const headers = [
    'Portfolio', 'Type', 'Asset', 'Amount',
    'Current Price', 'Value', 'Purchase Price',
    'Total Cost', 'Purchase Date', 'Notes',
  ]

  const rows = assets.map(asset => {
    const price = prices[asset.assetId]?.usd || 0
    const value = asset.amount * price
    const totalCost = asset.purchasePrice ? asset.amount * asset.purchasePrice : ''
    const escapedNotes = asset.notes ? `"${asset.notes.replace(/"/g, '""')}"` : ''
    return [
      asset.portfolio,
      asset.type,
      getAssetSymbol(asset.assetId, asset.type),
      asset.amount,
      price.toFixed(2),
      value.toFixed(2),
      asset.purchasePrice || '',
      totalCost ? totalCost.toFixed(2) : '',
      asset.purchaseDate || '',
      escapedNotes,
    ]
  })

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Parses a CSV string (exported by generateCSV) into an assets array.
 * Does not interact with FileReader — the caller handles file I/O.
 */
export function parseCSV(text) {
  const lines = text.split('\n').slice(1)

  return lines
    .filter(line => line.trim())
    .map((line, index) => {
      const parts = []
      let current = ''
      let inQuotes = false

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          parts.push(current)
          current = ''
        } else {
          current += char
        }
      }
      parts.push(current)

      const [portfolio, type, assetSymbol, amount, , , purchasePrice, , purchaseDate, notes] = parts
      let assetId

      if (type?.trim() === 'crypto') {
        assetId = supportedCryptos.find(c => c.symbol === assetSymbol?.trim())?.id
      } else {
        assetId = assetSymbol?.trim()
      }

      if (!assetId || !portfolio || !amount) return null

      return {
        id: Date.now() + index,
        portfolio: portfolio.trim(),
        type: type.trim(),
        assetId,
        amount: parseFloat(amount),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        purchaseDate: purchaseDate?.trim() || null,
        notes: notes?.trim().replace(/""/g, '"') || '',
      }
    })
    .filter(Boolean)
}
