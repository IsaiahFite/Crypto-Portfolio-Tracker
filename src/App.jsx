import { calculatePortfolioTotal } from './js/portfolio'
import useAssets from './hooks/useAssets'
import usePortfolioNav from './hooks/usePortfolioNav'
import useAddAssetForm from './hooks/useAddAssetForm'
import Sidebar from './components/Sidebar'
import AddAssetForm from './components/AddAssetForm'
import AssetRow from './components/AssetRow'
import { Plus, BriefcaseIcon, ChevronLeft, XIcon } from './components/Icons'

export default function CryptoPortfolioTracker() {
  const {
    storageEnabled, setStorageEnabled,
    assets, prices, loading, lastUpdate, error,
    assetsByPortfolio, portfolios, totalCombinedValue,
    addAsset: addAssetToStore, deleteAsset, updateAsset,
    fetchPrices, exportToCSV, importFromCSV,
  } = useAssets()

  const {
    selectedPortfolio, setSelectedPortfolio,
    showAddForm, setShowAddForm,
    creatingPortfolio, setCreatingPortfolio,
    newPortfolioName, setNewPortfolioName,
    newPortfolioInputRef,
    dashboardCreating, setDashboardCreating,
    dashboardPortfolioName, setDashboardPortfolioName,
    dashboardInputRef,
    editingId, editingAsset, setEditingAsset,
    navigateToPortfolio, startEditing, cancelEditing,
  } = usePortfolioNav()

  const {
    newAsset, setNewAsset,
    purchaseDateType, setPurchaseDateType,
    assetSearch, setAssetSearch,
    assetDropdownOpen, setAssetDropdownOpen,
    assetDropdownRef, resetForm,
  } = useAddAssetForm()

  // ── Bridge functions that cross hook boundaries ──

  const addAsset = () => {
    if (!selectedPortfolio || !newAsset.assetId || !newAsset.amount) return
    addAssetToStore({ portfolio: selectedPortfolio, ...newAsset })
    resetForm()
  }

  const saveEdit = (id) => {
    updateAsset(id, editingAsset)
    cancelEditing()
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 flex">

      <Sidebar
        selectedPortfolio={selectedPortfolio}
        portfolios={portfolios}
        assets={assets}
        prices={prices}
        creatingPortfolio={creatingPortfolio}
        newPortfolioName={newPortfolioName}
        newPortfolioInputRef={newPortfolioInputRef}
        storageEnabled={storageEnabled}
        loading={loading}
        onSelectPortfolio={setSelectedPortfolio}
        onSetCreating={setCreatingPortfolio}
        onPortfolioNameChange={setNewPortfolioName}
        onNavigate={navigateToPortfolio}
        onStorageToggle={setStorageEnabled}
        onImportCSV={importFromCSV}
        onExportCSV={exportToCSV}
        onRefresh={fetchPrices}
      />

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
                <div className="w-16 h-16 bg-slate-700/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BriefcaseIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-white/40 text-sm mb-5">No portfolios yet.</p>
                {dashboardCreating ? (
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      ref={dashboardInputRef}
                      type="text"
                      placeholder="Portfolio name…"
                      value={dashboardPortfolioName}
                      onChange={(e) => setDashboardPortfolioName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && dashboardPortfolioName.trim()) navigateToPortfolio(dashboardPortfolioName.trim())
                        else if (e.key === 'Escape') { setDashboardCreating(false); setDashboardPortfolioName('') }
                      }}
                      className="bg-white/10 border border-emerald-500/50 rounded-lg px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-56"
                    />
                    <button
                      onClick={() => { if (dashboardPortfolioName.trim()) navigateToPortfolio(dashboardPortfolioName.trim()) }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setDashboardCreating(false); setDashboardPortfolioName('') }}
                      className="text-white/30 hover:text-white/60 transition-colors px-2 py-2"
                    >
                      <XIcon />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDashboardCreating(true)}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus />
                    Create your first portfolio
                  </button>
                )}
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
                        <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">View portfolio →</span>
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
                <AddAssetForm
                  newAsset={newAsset}
                  assetSearch={assetSearch}
                  assetDropdownOpen={assetDropdownOpen}
                  assetDropdownRef={assetDropdownRef}
                  purchaseDateType={purchaseDateType}
                  onNewAssetChange={setNewAsset}
                  onAssetSearchChange={setAssetSearch}
                  onDropdownOpen={setAssetDropdownOpen}
                  onPurchaseDateType={setPurchaseDateType}
                  onAdd={addAsset}
                  onClose={() => setShowAddForm(false)}
                />
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
                {(assetsByPortfolio[selectedPortfolio] || []).map(asset => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    price={prices[asset.assetId]?.usd || 0}
                    isEditing={editingId === asset.id}
                    editingAsset={editingId === asset.id ? editingAsset : {}}
                    onStartEditing={startEditing}
                    onDelete={deleteAsset}
                    onSave={saveEdit}
                    onCancel={cancelEditing}
                    onEditChange={setEditingAsset}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
