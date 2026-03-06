import { useState, useEffect } from 'react'
import { supportedCryptos, supportedStocks } from './js/constants'
import { fetchAllPrices } from './js/api'
import {
  calculateOwnerTotal,
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const Trash2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
)

const RefreshCw = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
)

const DollarSign = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
)

const User = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const Download = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
)

const Upload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
)

const Edit2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
)

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CryptoStockPortfolioTracker() {
  const [storageEnabled, setStorageEnabled] = useState(() => {
    const saved = localStorage.getItem('portfolioStorageEnabled')
    return saved === 'true'
  })
  const [accounts, setAccounts] = useState(() => {
    if (localStorage.getItem('portfolioStorageEnabled') === 'true') {
      const saved = localStorage.getItem('portfolioAccounts')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [newAccount, setNewAccount] = useState({
    owner: '',
    asset: '',
    amount: '',
    type: 'crypto',
    notes: '',
    purchasePrice: '',
    purchaseDate: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [editingAccount, setEditingAccount] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    localStorage.setItem('portfolioStorageEnabled', storageEnabled.toString())
    if (!storageEnabled) {
      localStorage.removeItem('portfolioAccounts')
    }
  }, [storageEnabled])

  useEffect(() => {
    if (storageEnabled) {
      localStorage.setItem('portfolioAccounts', JSON.stringify(accounts))
    }
  }, [accounts, storageEnabled])

  const fetchPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const allPrices = await fetchAllPrices(accounts)
      setPrices(allPrices)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching prices:', err)
      setError('Failed to fetch prices. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (accounts.length === 0) return
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [accounts.length])

  const addAccount = () => {
    if (newAccount.owner && newAccount.asset && newAccount.amount) {
      setAccounts([...accounts, {
        id: Date.now(),
        owner: newAccount.owner,
        asset: newAccount.asset,
        type: newAccount.type,
        amount: parseFloat(newAccount.amount),
        notes: newAccount.notes || '',
        purchasePrice: newAccount.purchasePrice ? parseFloat(newAccount.purchasePrice) : null,
        purchaseDate: newAccount.purchaseDate || null,
      }])
      setNewAccount({ owner: '', asset: '', amount: '', type: 'crypto', notes: '', purchasePrice: '', purchaseDate: '' })
    }
  }

  const deleteAccount = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id))
  }

  const startEditing = (account) => {
    setEditingId(account.id)
    setEditingAccount({
      amount: account.amount.toString(),
      notes: account.notes || '',
      purchasePrice: account.purchasePrice?.toString() || '',
      purchaseDate: account.purchaseDate || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingAccount({})
  }

  const saveEdit = (id) => {
    const amount = parseFloat(editingAccount.amount)
    if (amount && amount > 0) {
      setAccounts(accounts.map(acc =>
        acc.id === id ? {
          ...acc,
          amount,
          notes: editingAccount.notes || '',
          purchasePrice: editingAccount.purchasePrice ? parseFloat(editingAccount.purchasePrice) : null,
          purchaseDate: editingAccount.purchaseDate || null,
        } : acc
      ))
    }
    cancelEditing()
  }

  const exportToCSV = () => {
    const csvContent = generateCSV(accounts, prices)
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
      if (imported.length > 0) {
        setAccounts(imported)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const accountsByOwner = accounts.reduce((groups, account) => {
    const owner = account.owner
    if (!groups[owner]) groups[owner] = []
    groups[owner].push(account)
    return groups
  }, {})

  const owners = Object.keys(accountsByOwner).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-bold text-white">Crypto &amp; Stock Portfolio Tracker</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storageEnabled}
                  onChange={(e) => setStorageEnabled(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm">Save locally</span>
              </label>
              <label className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <Upload />
                Import CSV
                <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
              </label>
              <button
                onClick={exportToCSV}
                disabled={accounts.length === 0}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download />
                Export CSV
              </button>
              <button
                onClick={fetchPrices}
                disabled={loading || accounts.length === 0}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {lastUpdate && (
            <p className="text-white/60 text-sm mb-6">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Add Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Owner name"
                value={newAccount.owner}
                onChange={(e) => setNewAccount({ ...newAccount, owner: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value, asset: '' })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="crypto" className="bg-slate-800">Cryptocurrency</option>
                <option value="stock" className="bg-slate-800">Stock</option>
              </select>
              <select
                value={newAccount.asset}
                onChange={(e) => setNewAccount({ ...newAccount, asset: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select {newAccount.type === 'crypto' ? 'crypto' : 'stock'}</option>
                {newAccount.type === 'crypto' ? (
                  supportedCryptos.map(crypto => (
                    <option key={crypto.id} value={crypto.id} className="bg-slate-800">
                      {crypto.symbol} - {crypto.name}
                    </option>
                  ))
                ) : (
                  supportedStocks.map(stock => (
                    <option key={stock.symbol} value={stock.symbol} className="bg-slate-800">
                      {stock.symbol} - {stock.name}
                    </option>
                  ))
                )}
              </select>
              <input
                type="number"
                step="0.00000001"
                placeholder="Amount *"
                value={newAccount.amount}
                onChange={(e) => setNewAccount({ ...newAccount, amount: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="number"
                step="0.01"
                placeholder="Purchase price per unit (optional)"
                value={newAccount.purchasePrice}
                onChange={(e) => setNewAccount({ ...newAccount, purchasePrice: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="date"
                placeholder="Purchase date (optional)"
                value={newAccount.purchaseDate}
                onChange={(e) => setNewAccount({ ...newAccount, purchaseDate: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newAccount.notes}
                onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={addAccount}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus />
                Add Account
              </button>
            </div>
          </div>

          {accounts.length > 0 ? (
            <div className="space-y-8">
              {owners.map(owner => (
                <div key={owner} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-blue-400" />
                      <h2 className="text-2xl font-bold text-white">{owner}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-sm">Total Value</div>
                      <div className="text-2xl font-bold text-emerald-400">
                        ${calculateOwnerTotal(accounts, prices, owner).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {accountsByOwner[owner].map(account => {
                      const price = prices[account.asset]?.usd || 0
                      const isEditing = editingId === account.id
                      const { value, totalCost, gainLoss, gainLossPercent } = calculateGainLoss(
                        account.amount, price, account.purchasePrice
                      )

                      return (
                        <div key={account.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className={`${account.type === 'crypto' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'} px-3 py-1 rounded-full text-sm font-semibold`}>
                                  {getAssetSymbol(account.asset, account.type)}
                                </span>
                                <h3 className="text-lg font-medium text-white/80">{getAssetName(account.asset, account.type)}</h3>
                                <span className="text-xs text-white/40 uppercase">{account.type}</span>
                              </div>

                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <div className="text-white/60 text-sm mb-1">Amount</div>
                                      <input
                                        type="number"
                                        step="0.00000001"
                                        value={editingAccount.amount}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, amount: e.target.value })}
                                        className="bg-white/10 border border-emerald-500 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        autoFocus
                                      />
                                    </div>
                                    <div>
                                      <div className="text-white/60 text-sm mb-1">Purchase Price</div>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Per unit"
                                        value={editingAccount.purchasePrice}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, purchasePrice: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-white/60 text-sm mb-1">Purchase Date</div>
                                      <input
                                        type="date"
                                        value={editingAccount.purchaseDate}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, purchaseDate: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-white/60 text-sm mb-1">Notes</div>
                                      <input
                                        type="text"
                                        value={editingAccount.notes}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, notes: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <div className="text-white/60">Amount</div>
                                      <div className="text-white font-medium">{account.amount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                      <div className="text-white/60">Price</div>
                                      <div className="text-white font-medium">
                                        ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-white/60">Value</div>
                                      <div className="text-emerald-400 font-bold">
                                        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                  </div>

                                  {(account.purchasePrice || account.purchaseDate || account.notes) && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        {account.purchasePrice && (
                                          <div>
                                            <div className="text-white/60">Purchase Price</div>
                                            <div className="text-white/80">${account.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                          </div>
                                        )}
                                        {totalCost && (
                                          <div>
                                            <div className="text-white/60">Total Cost</div>
                                            <div className="text-white/80">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                          </div>
                                        )}
                                        {gainLoss !== null && (
                                          <div>
                                            <div className="text-white/60">Gain/Loss</div>
                                            <div className={gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                              {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                              <span className="text-xs ml-1">({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)</span>
                                            </div>
                                          </div>
                                        )}
                                        {account.purchaseDate && (
                                          <div>
                                            <div className="text-white/60">Purchase Date</div>
                                            <div className="text-white/80">{new Date(account.purchaseDate).toLocaleDateString()}</div>
                                          </div>
                                        )}
                                      </div>
                                      {account.notes && (
                                        <div className="mt-2">
                                          <div className="text-white/60 text-sm">Notes</div>
                                          <div className="text-white/80 text-sm">{account.notes}</div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveEdit(account.id)}
                                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 p-2 rounded-lg transition-colors"
                                  >
                                    <Check />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 p-2 rounded-lg transition-colors"
                                  >
                                    <XIcon />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditing(account)}
                                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded-lg transition-colors"
                                  >
                                    <Edit2 />
                                  </button>
                                  <button
                                    onClick={() => deleteAccount(account.id)}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No accounts added yet. Add your first account above or import a CSV file to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
