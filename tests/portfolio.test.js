import { describe, it, expect } from 'vitest'
import {
  calculateGainLoss,
  calculatePortfolioTotal,
  generateCSV,
  parseCSV,
  getAssetSymbol,
  getAssetName,
} from '../src/js/portfolio'

// ---------------------------------------------------------------------------
// calculateGainLoss
// ---------------------------------------------------------------------------

describe('calculateGainLoss', () => {
  it('returns correct gain when current price is higher than purchase price', () => {
    const result = calculateGainLoss(10, 50, 30)
    expect(result.value).toBe(500)
    expect(result.totalCost).toBe(300)
    expect(result.gainLoss).toBeCloseTo(200)
    expect(result.gainLossPercent).toBeCloseTo(66.67, 1)
  })

  it('returns negative gain/loss when current price is lower than purchase price', () => {
    const result = calculateGainLoss(5, 20, 40)
    expect(result.value).toBe(100)
    expect(result.totalCost).toBe(200)
    expect(result.gainLoss).toBe(-100)
    expect(result.gainLossPercent).toBe(-50)
  })

  it('returns nulls when no purchase price is provided', () => {
    const result = calculateGainLoss(10, 50, null)
    expect(result.value).toBe(500)
    expect(result.totalCost).toBeNull()
    expect(result.gainLoss).toBeNull()
    expect(result.gainLossPercent).toBeNull()
  })

  it('handles zero current price', () => {
    const result = calculateGainLoss(10, 0, 100)
    expect(result.value).toBe(0)
    expect(result.gainLoss).toBe(-1000)
  })
})

// ---------------------------------------------------------------------------
// calculatePortfolioTotal
// ---------------------------------------------------------------------------

describe('calculatePortfolioTotal', () => {
  const prices = {
    bitcoin: { usd: 50000 },
    ethereum: { usd: 3000 },
  }

  const assets = [
    { portfolio: 'Alice', assetId: 'bitcoin', amount: 1, type: 'crypto' },
    { portfolio: 'Alice', assetId: 'ethereum', amount: 2, type: 'crypto' },
    { portfolio: 'Bob', assetId: 'bitcoin', amount: 0.5, type: 'crypto' },
  ]

  it('sums value for the correct portfolio only', () => {
    // Alice: 1 BTC * 50000 + 2 ETH * 3000 = 56000
    expect(calculatePortfolioTotal(assets, prices, 'Alice')).toBe(56000)
  })

  it('handles portfolio with a single asset', () => {
    // Bob: 0.5 BTC * 50000 = 25000
    expect(calculatePortfolioTotal(assets, prices, 'Bob')).toBe(25000)
  })

  it('returns 0 for unknown portfolio', () => {
    expect(calculatePortfolioTotal(assets, prices, 'Charlie')).toBe(0)
  })

  it('falls back to 0 when price is missing', () => {
    const noPrices = {}
    expect(calculatePortfolioTotal(assets, noPrices, 'Alice')).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// generateCSV / parseCSV round-trip
// ---------------------------------------------------------------------------

describe('generateCSV', () => {
  const prices = { bitcoin: { usd: 50000 } }
  const assets = [
    {
      portfolio: 'Alice',
      type: 'crypto',
      assetId: 'bitcoin',
      amount: 1,
      purchasePrice: 30000,
      purchaseDate: '2023-01-01',
      notes: '',
    },
  ]

  it('includes the correct headers', () => {
    const csv = generateCSV(assets, prices)
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toContain('Portfolio')
    expect(firstLine).toContain('Asset')
    expect(firstLine).toContain('Value')
    expect(firstLine).not.toContain('Gain/Loss') // Gain/Loss is computed inline, not a CSV column
  })

  it('includes one data row per asset', () => {
    const csv = generateCSV(assets, prices)
    const lines = csv.split('\n').filter(l => l.trim())
    expect(lines.length).toBe(2) // header + 1 data row
  })

  it('escapes notes containing commas', () => {
    const withComma = [{ ...assets[0], notes: 'bought, then sold' }]
    const csv = generateCSV(withComma, prices)
    expect(csv).toContain('"bought, then sold"')
  })
})

describe('parseCSV', () => {
  it('round-trips assets through generateCSV → parseCSV', () => {
    const prices = { bitcoin: { usd: 50000 } }
    const original = [
      {
        portfolio: 'Alice',
        type: 'crypto',
        assetId: 'bitcoin',
        amount: 2.5,
        purchasePrice: 30000,
        purchaseDate: '2023-01-01',
        notes: 'long term hold',
      },
    ]

    const csv = generateCSV(original, prices)
    const parsed = parseCSV(csv)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].portfolio).toBe('Alice')
    expect(parsed[0].assetId).toBe('bitcoin')
    expect(parsed[0].amount).toBe(2.5)
    expect(parsed[0].purchasePrice).toBe(30000)
    expect(parsed[0].notes).toBe('long term hold')
  })

  it('handles notes with commas correctly', () => {
    const prices = { bitcoin: { usd: 50000 } }
    const original = [
      {
        portfolio: 'Bob',
        type: 'crypto',
        assetId: 'bitcoin',
        amount: 1,
        purchasePrice: null,
        purchaseDate: null,
        notes: 'bought here, sold there',
      },
    ]

    const csv = generateCSV(original, prices)
    const parsed = parseCSV(csv)
    expect(parsed[0].notes).toBe('bought here, sold there')
  })

  it('filters out rows with missing required fields', () => {
    const malformed = 'Portfolio,Type,Asset,Amount\n,,,'
    const parsed = parseCSV(malformed)
    expect(parsed).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// getAssetSymbol / getAssetName
// ---------------------------------------------------------------------------

describe('getAssetSymbol', () => {
  it('returns the correct symbol for a known crypto', () => {
    expect(getAssetSymbol('bitcoin', 'crypto')).toBe('BTC')
  })

  it('falls back to uppercased id for unknown crypto', () => {
    expect(getAssetSymbol('unknown-coin', 'crypto')).toBe('UNKNOWN-COIN')
  })

  it('returns the asset id directly for stocks', () => {
    expect(getAssetSymbol('GLD', 'stock')).toBe('GLD')
  })
})

describe('getAssetName', () => {
  it('returns the full name for a known crypto', () => {
    expect(getAssetName('ethereum', 'crypto')).toBe('Ethereum')
  })

  it('returns the full name for a known stock', () => {
    expect(getAssetName('GLD', 'stock')).toBe('SPDR Gold Shares')
  })

  it('falls back to the id for unknown assets', () => {
    expect(getAssetName('unknown-coin', 'crypto')).toBe('unknown-coin')
  })
})
