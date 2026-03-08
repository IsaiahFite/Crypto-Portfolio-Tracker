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

export function calculateOwnerTotal(accounts, prices, owner) {
  return accounts
    .filter(acc => acc.owner === owner)
    .reduce((total, account) => {
      const price = prices[account.asset]?.usd || 0
      return total + account.amount * price
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
export function generateCSV(accounts, prices) {
  const headers = [
    'Owner', 'Type', 'Asset', 'Amount',
    'Current Price', 'Value', 'Purchase Price',
    'Total Cost', 'Purchase Date', 'Notes',
  ]

  const rows = accounts.map(account => {
    const price = prices[account.asset]?.usd || 0
    const value = account.amount * price
    const totalCost = account.purchasePrice ? account.amount * account.purchasePrice : ''
    const escapedNotes = account.notes ? `"${account.notes.replace(/"/g, '""')}"` : ''
    return [
      account.owner,
      account.type,
      getAssetSymbol(account.asset, account.type),
      account.amount,
      price.toFixed(2),
      value.toFixed(2),
      account.purchasePrice || '',
      totalCost ? totalCost.toFixed(2) : '',
      account.purchaseDate || '',
      escapedNotes,
    ]
  })

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Parses a CSV string (exported by generateCSV) into an accounts array.
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

      const [owner, type, assetSymbol, amount, , , purchasePrice, , purchaseDate, notes] = parts
      let asset

      if (type?.trim() === 'crypto') {
        asset = supportedCryptos.find(c => c.symbol === assetSymbol?.trim())?.id
      } else {
        asset = assetSymbol?.trim()
      }

      if (!asset || !owner || !amount) return null

      return {
        id: Date.now() + index,
        owner: owner.trim(),
        type: type.trim(),
        asset,
        amount: parseFloat(amount),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        purchaseDate: purchaseDate?.trim() || null,
        notes: notes?.trim().replace(/""/g, '"') || '',
      }
    })
    .filter(Boolean)
}
