import PropTypes from 'prop-types'
import { calculatePortfolioTotal } from '../js/portfolio'
import { DollarSign, HomeIcon, Plus, RefreshCw, Upload, Download } from './Icons'

export default function Sidebar({
  selectedPortfolio,
  portfolios,
  assets,
  prices,
  creatingPortfolio,
  newPortfolioName,
  newPortfolioInputRef,
  storageEnabled,
  loading,
  onSelectPortfolio,
  onSetCreating,
  onPortfolioNameChange,
  onNavigate,
  onStorageToggle,
  onImportCSV,
  onExportCSV,
  onRefresh,
}) {
  return (
    <aside className="w-56 min-h-screen bg-slate-900 border-r border-white/10 flex flex-col flex-shrink-0">

      <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <DollarSign className="text-emerald-400" />
        </div>
        <span className="text-white font-semibold text-sm">Portfolio Tracker</span>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        <button
          onClick={() => onSelectPortfolio(null)}
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
                onClick={() => onSelectPortfolio(p)}
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
              onChange={(e) => onPortfolioNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPortfolioName.trim()) {
                  onNavigate(newPortfolioName.trim())
                } else if (e.key === 'Escape') {
                  onSetCreating(false)
                  onPortfolioNameChange('')
                }
              }}
              onBlur={() => {
                if (!newPortfolioName.trim()) onSetCreating(false)
              }}
              className="w-full bg-white/10 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          ) : (
            <button
              onClick={() => onSetCreating(true)}
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
            onChange={(e) => onStorageToggle(e.target.checked)}
            className="w-3.5 h-3.5 accent-emerald-500"
          />
          Save locally
        </label>
        <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 cursor-pointer hover:text-white/70 hover:bg-white/5 transition-colors">
          <Upload />
          Import CSV
          <input type="file" accept=".csv" onChange={onImportCSV} className="hidden" />
        </label>
        <button
          onClick={onExportCSV}
          disabled={assets.length === 0}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <Download />
          Export CSV
        </button>
        <button
          onClick={onRefresh}
          disabled={loading || assets.length === 0}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing…' : 'Refresh prices'}
        </button>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  selectedPortfolio: PropTypes.string,
  portfolios: PropTypes.arrayOf(PropTypes.string).isRequired,
  assets: PropTypes.array.isRequired,
  prices: PropTypes.object.isRequired,
  creatingPortfolio: PropTypes.bool.isRequired,
  newPortfolioName: PropTypes.string.isRequired,
  newPortfolioInputRef: PropTypes.object.isRequired,
  storageEnabled: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onSelectPortfolio: PropTypes.func.isRequired,
  onSetCreating: PropTypes.func.isRequired,
  onPortfolioNameChange: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onStorageToggle: PropTypes.func.isRequired,
  onImportCSV: PropTypes.func.isRequired,
  onExportCSV: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
}
