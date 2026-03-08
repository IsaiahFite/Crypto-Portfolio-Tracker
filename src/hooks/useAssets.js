import { useState, useEffect } from 'react'
import { fetchAllPrices } from '../js/api'
import { calculatePortfolioTotal, generateCSV, parseCSV } from '../js/portfolio'

export default function useAssets() {
  const [storageEnabled, setStorageEnabled] = useState(() =>
    localStorage.getItem('portfolioStorageEnabled') === 'true'
  )
  const [assets, setAssets] = useState(() => {
    if (localStorage.getItem('portfolioStorageEnabled') === 'true') {
      const saved = localStorage.getItem('portfolioAssets')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    localStorage.setItem('portfolioStorageEnabled', storageEnabled.toString())
    if (!storageEnabled) localStorage.removeItem('portfolioAssets')
  }, [storageEnabled])

  useEffect(() => {
    if (storageEnabled) localStorage.setItem('portfolioAssets', JSON.stringify(assets))
  }, [assets, storageEnabled])

  const fetchPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const allPrices = await fetchAllPrices(assets)
      setPrices(allPrices)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching prices:', err)
      setError('Failed to fetch prices. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (assets.length === 0) return
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets.length])

  const addAsset = ({ portfolio, assetId, type, amount, notes, purchasePrice, purchaseDate }) => {
    setAssets(prev => [...prev, {
      id: Date.now(),
      portfolio,
      assetId,
      type,
      amount: parseFloat(amount),
      notes: notes || '',
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      purchaseDate: purchaseDate || null,
    }])
  }

  const deleteAsset = (id) => setAssets(prev => prev.filter(a => a.id !== id))

  const updateAsset = (id, { amount, notes, purchasePrice, purchaseDate }) => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) return
    setAssets(prev => prev.map(a =>
      a.id === id ? {
        ...a,
        amount: parsed,
        notes: notes || '',
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        purchaseDate: purchaseDate || null,
      } : a
    ))
  }

  const exportToCSV = () => {
    const csvContent = generateCSV(assets, prices)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const importFromCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const imported = parseCSV(e.target.result)
      if (imported.length > 0) setAssets(imported)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  // Derived
  const assetsByPortfolio = assets.reduce((groups, asset) => {
    const p = asset.portfolio
    if (!groups[p]) groups[p] = []
    groups[p].push(asset)
    return groups
  }, {})

  const portfolios = Object.keys(assetsByPortfolio).sort()

  const totalCombinedValue = portfolios.reduce(
    (sum, p) => sum + calculatePortfolioTotal(assets, prices, p), 0
  )

  return {
    storageEnabled, setStorageEnabled,
    assets,
    prices,
    loading,
    lastUpdate,
    error,
    assetsByPortfolio,
    portfolios,
    totalCombinedValue,
    addAsset,
    deleteAsset,
    updateAsset,
    fetchPrices,
    exportToCSV,
    importFromCSV,
  }
}
