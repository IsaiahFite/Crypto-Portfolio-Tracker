import { useState, useEffect, useRef } from 'react'
import { supportedCryptos, supportedStocks } from './js/constants'
import { fetchAllPrices } from './js/api'
import {
  calculatePortfolioTotal,
  calculateGainLoss,
  getAssetSymbol,
  getAssetName,
  generateCSV,
  parseCSV,
} from './js/portfolio'

// ---------------------------------------------------------------------------
// SVG icon components
// ---------------------------------------------------------------------------

const Plus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const Trash2 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)
const RefreshCw = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)
const DollarSign = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const Download = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const Upload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)
const Edit2 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CryptoPortfolioTracker() {
  // Persistence
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

  // Prices & status
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  // Navigation
  const [selectedPortfolio, setSelectedPortfolio] = useState(null) // null = dashboard
  const [showAddForm, setShowAddForm] = useState(false)
  const [creatingPortfolio, setCreatingPortfolio] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const newPortfolioInputRef = useRef(null)

  // Add-asset form
  const [newAsset, setNewAsset] = useState({
    assetId: '', amount: '', type: 'crypto', notes: '', purchasePrice: '', purchaseDate: '',
  })

  // Edit
  const [editingId, setEditingId] = useState(null)
  const [editingAsset, setEditingAsset] = useState({})

  // ── Effects ──

  useEffect(() => {
    localStorage.setItem('portfolioStorageEnabled', storageEnabled.toString())
    if (!storageEnabled) localStorage.removeItem('portfolioAssets')
  }, [storageEnabled])

  useEffect(() => {
    if (storageEnabled) localStorage.setItem('portfolioAssets', JSON.stringify(assets))
  }, [assets, storageEnabled])

  useEffect(() => {
    if (creatingPortfolio && newPortfolioInputRef.current) {
      newPortfolioInputRef.current.focus()
    }
  }, [creatingPortfolio])

  // Reset view state when switching portfolios
  useEffect(() => {
    setShowAddForm(false)
    setEditingId(null)
    setEditingAsset({})
  }, [selectedPortfolio])

  // ── Price fetching ──

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

  // ── CRUD ──

  const addAsset = () => {
    if (!selectedPortfolio || !newAsset.assetId || !newAsset.amount) return
    setAssets([...assets, {
      id: Date.now(),
      portfolio: selectedPortfolio,
      assetId: newAsset.assetId,
      type: newAsset.type,
      amount: parseFloat(newAsset.amount),
      notes: newAsset.notes || '',
      purchasePrice: newAsset.purchasePrice ? parseFloat(newAsset.purchasePrice) : null,
      purchaseDate: newAsset.purchaseDate || null,
    }])
    setNewAsset({ assetId: '', amount: '', type: 'crypto', notes: '', purchasePrice: '', purchaseDate: '' })
  }

  const deleteAsset = (id) => setAssets(assets.filter(a => a.id !== id))

  const startEditing = (asset) => {
    setEditingId(asset.id)
    setEditingAsset({
      amount: asset.amount.toString(),
      notes: asset.notes || '',
      purchasePrice: asset.purchasePrice?.toString() || '',
      purchaseDate: asset.purchaseDate || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingAsset({})
  }

  const saveEdit = (id) => {
    const amount = parseFloat(editingAsset.amount)
    if (amount && amount > 0) {
      setAssets(assets.map(a =>
        a.id === id ? {
          ...a,
          amount,
          notes: editingAsset.notes || '',
          purchasePrice: editingAsset.purchasePrice ? parseFloat(editingAsset.purchasePrice) : null,
          purchaseDate: editingAsset.purchaseDate || null,
        } : a
      ))
    }
    cancelEditing()
  }

  // ── CSV ──

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

  // ── New portfolio flow ──

  const navigateToPortfolio = (name) => {
    setSelectedPortfolio(name)
    setCreatingPortfolio(false)
    setNewPortfolioName('')
    setShowAddForm(true)
  }

  // ── Derived state ──

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

  const inputCls = 'bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500'

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 min-h-screen bg-slate-900/70 border-r border-white/10 flex flex-col flex-shrink-0">

        <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="text-emerald-400" />
          </div>
          <span className="text-white font-semibold text-sm">Portfolio Tracker</span>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          <button
            onClick={() => setSelectedPortfolio(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              selectedPortfolio === null
                ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <HomeIcon />
            Dashboard
          </button>

          {portfolios.length > 0 && (
            <div className="pt-3">
              <div className="px-3 mb-1.5 text-xs font-semibold text-white/30 uppercase tracking-wider">
                Portfolios
              </div>
              {portfolios.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPortfolio(p)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    selectedPortfolio === p
                      ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate mr-2">{p}</span>
                  <span className="text-xs opacity-50 flex-shrink-0 tabular-nums">
                    ${calculatePortfolioTotal(assets, prices, p).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="pt-1">
            {creatingPortfolio ? (
              <input
                ref={newPortfolioInputRef}
                type="text"
                placeholder="Portfolio name…"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPortfolioName.trim()) {
                    navigateToPortfolio(newPortfolioName.trim())
                  } else if (e.key === 'Escape') {
                    setCreatingPortfolio(false)
                    setNewPortfolioName('')
                  }
                }}
                onBlur={() => {
                  if (!newPortfolioName.trim()) setCreatingPortfolio(false)
                }}
                className="w-full bg-white/10 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            ) : (
              <button
                onClick={() => setCreatingPortfolio(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                <Plus />
                New Portfolio
              </button>
            )}
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 space-y-0.5">
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 cursor-pointer hover:text-white/70 hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={storageEnabled}
              onChange={(e) => setStorageEnabled(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-500"
            />
            Save locally
          </label>
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 cursor-pointer hover:text-white/70 hover:bg-white/5 transition-colors">
            <Upload />
            Import CSV
            <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
          </label>
          <button
            onClick={exportToCSV}
            disabled={assets.length === 0}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 transition-colors"
          >
            <Download />
            Export CSV
          </button>
          <button
            onClick={fetchPrices}
            disabled={loading || assets.length === 0}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 transition-colors"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing…' : 'Refresh prices'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto p-6 min-w-0">

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-5 text-red-300 text-sm">
            {error}
          </div>
        )}

        {selectedPortfolio === null ? (

          /* ── Dashboard ── */
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">My Portfolios</h1>
                {lastUpdate && (
                  <p className="text-white/40 text-xs mt-1">Updated {lastUpdate.toLocaleTimeString()}</p>
                )}
              </div>
              {assets.length > 0 && (
                <div className="text-right">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Combined value</div>
                  <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                    ${totalCombinedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>

            {portfolios.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BriefcaseIcon />
                </div>
                <p className="text-white/40 text-sm mb-5">No portfolios yet.</p>
                <button
                  onClick={() => setCreatingPortfolio(true)}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus />
                  Create your first portfolio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map(p => {
                  const total = calculatePortfolioTotal(assets, prices, p)
                  const portfolioAssets = assetsByPortfolio[p] || []
                  const cryptoCount = portfolioAssets.filter(a => a.type === 'crypto').length
                  const stockCount = portfolioAssets.filter(a => a.type === 'stock').length
                  return (
                    <div
                      key={p}
                      onClick={() => setSelectedPortfolio(p)}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-white font-semibold text-lg leading-tight">{p}</h2>
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                          <BriefcaseIcon />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400 mb-3 tabular-nums">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span>{portfolioAssets.length} asset{portfolioAssets.length !== 1 ? 's' : ''}</span>
                        {cryptoCount > 0 && <span className="text-emerald-400/70">{cryptoCount} crypto</span>}
                        {stockCount > 0 && <span className="text-blue-400/70">{stockCount} stock{stockCount !== 1 ? 's' : ''}</span>}
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                          View portfolio →
                        </span>
                      </div>
                    </div>
                  )
                })}

                <button
                  onClick={() => setCreatingPortfolio(true)}
                  className="bg-transparent border border-dashed border-white/15 rounded-xl p-5 hover:border-white/30 hover:bg-white/[0.03] transition-all text-white/30 hover:text-white/50 flex flex-col items-center justify-center gap-2 min-h-[168px]"
                >
                  <Plus />
                  <span className="text-sm">New Portfolio</span>
                </button>
              </div>
            )}
          </div>

        ) : (

          /* ── Portfolio detail ── */
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <button
                  onClick={() => setSelectedPortfolio(null)}
                  className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-2"
                >
                  <ChevronLeft />
                  Dashboard
                </button>
                <h1 className="text-2xl font-bold text-white">{selectedPortfolio}</h1>
              </div>
              <div className="text-right">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Total value</div>
                <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                  ${calculatePortfolioTotal(assets, prices, selectedPortfolio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="mb-5">
              {showAddForm ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold text-sm">Add Asset</h2>
                    <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white/70 transition-colors">
                      <XIcon />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <select
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value, assetId: '' })}
                      className={inputCls}
                    >
                      <option value="crypto" className="bg-slate-800">Cryptocurrency</option>
                      <option value="stock" className="bg-slate-800">Stock</option>
                    </select>
                    <select
                      value={newAsset.assetId}
                      onChange={(e) => setNewAsset({ ...newAsset, assetId: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">Select {newAsset.type === 'crypto' ? 'crypto' : 'stock'}</option>
                      {newAsset.type === 'crypto'
                        ? supportedCryptos.map(c => (
                          <option key={c.id} value={c.id} className="bg-slate-800">{c.symbol} – {c.name}</option>
                        ))
                        : supportedStocks.map(s => (
                          <option key={s.symbol} value={s.symbol} className="bg-slate-800">{s.symbol} – {s.name}</option>
                        ))
                      }
                    </select>
                    <input
                      type="number" step="0.00000001" placeholder="Amount *"
                      value={newAsset.amount}
                      onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <input
                      type="number" step="0.01" placeholder="Purchase price (optional)"
                      value={newAsset.purchasePrice}
                      onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="date"
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="text" placeholder="Notes (optional)"
                      value={newAsset.notes}
                      onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={addAsset}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus />
                      Add Asset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus />
                  Add Asset
                </button>
              )}
            </div>

            {(assetsByPortfolio[selectedPortfolio] || []).length === 0 ? (
              <div className="text-center py-16 text-white/30 text-sm">
                No assets yet. Add your first asset above.
              </div>
            ) : (
              <div className="space-y-2">
                {(assetsByPortfolio[selectedPortfolio] || []).map(asset => {
                  const price = prices[asset.assetId]?.usd || 0
                  const isEditing = editingId === asset.id
                  const { value, totalCost, gainLoss, gainLossPercent } = calculateGainLoss(
                    asset.amount, price, asset.purchasePrice
                  )

                  return (
                    <div key={asset.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              asset.type === 'crypto'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {getAssetSymbol(asset.assetId, asset.type)}
                            </span>
                            <span className="text-white/80 font-medium text-sm">
                              {getAssetName(asset.assetId, asset.type)}
                            </span>
                            <span className="text-white/30 text-xs uppercase">{asset.type}</span>
                            {gainLoss !== null && (
                              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                                gainLoss >= 0
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-red-500/15 text-red-400'
                              }`}>
                                {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                              </span>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[
                                { label: 'Amount', key: 'amount', type: 'number', step: '0.00000001', placeholder: '' },
                                { label: 'Purchase Price', key: 'purchasePrice', type: 'number', step: '0.01', placeholder: 'Per unit' },
                                { label: 'Purchase Date', key: 'purchaseDate', type: 'date', step: '', placeholder: '' },
                                { label: 'Notes', key: 'notes', type: 'text', step: '', placeholder: '' },
                              ].map(({ label, key, type, step, placeholder }) => (
                                <div key={key}>
                                  <div className="text-white/40 text-xs mb-1">{label}</div>
                                  <input
                                    type={type}
                                    step={step || undefined}
                                    placeholder={placeholder}
                                    value={editingAsset[key]}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, [key]: e.target.value })}
                                    autoFocus={key === 'amount'}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-white/40 text-xs mb-0.5">Amount</div>
                                  <div className="text-white font-medium tabular-nums">{asset.amount.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-white/40 text-xs mb-0.5">Price</div>
                                  <div className="text-white font-medium tabular-nums">
                                    ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-white/40 text-xs mb-0.5">Value</div>
                                  <div className="text-emerald-400 font-bold tabular-nums">
                                    ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                              </div>

                              {(asset.purchasePrice || asset.purchaseDate || asset.notes) && (
                                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  {asset.purchasePrice && (
                                    <div>
                                      <div className="text-white/40 text-xs mb-0.5">Purchase Price</div>
                                      <div className="text-white/70 tabular-nums">
                                        ${asset.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                  )}
                                  {totalCost && (
                                    <div>
                                      <div className="text-white/40 text-xs mb-0.5">Total Cost</div>
                                      <div className="text-white/70 tabular-nums">
                                        ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                  )}
                                  {gainLoss !== null && (
                                    <div>
                                      <div className="text-white/40 text-xs mb-0.5">Gain / Loss</div>
                                      <div className={`tabular-nums font-medium ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                  )}
                                  {asset.purchaseDate && (
                                    <div>
                                      <div className="text-white/40 text-xs mb-0.5">Purchase Date</div>
                                      <div className="text-white/70">{new Date(asset.purchaseDate).toLocaleDateString()}</div>
                                    </div>
                                  )}
                                  {asset.notes && (
                                    <div className="md:col-span-4">
                                      <div className="text-white/40 text-xs mb-0.5">Notes</div>
                                      <div className="text-white/70 text-sm">{asset.notes}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(asset.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                              >
                                <Check />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
                              >
                                <XIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(asset)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                              >
                                <Edit2 />
                              </button>
                              <button
                                onClick={() => deleteAsset(asset.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                              >
                                <Trash2 />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
