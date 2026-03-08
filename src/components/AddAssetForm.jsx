import PropTypes from 'prop-types'
import { supportedCryptos, supportedStocks } from '../js/constants'
import { Plus, XIcon } from './Icons'

const inputCls = 'bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500'

export default function AddAssetForm({
  newAsset,
  assetSearch,
  assetDropdownOpen,
  assetDropdownRef,
  purchaseDateType,
  onNewAssetChange,
  onAssetSearchChange,
  onDropdownOpen,
  onPurchaseDateType,
  onAdd,
  onClose,
}) {
  const selectedLabel = newAsset.assetId
    ? newAsset.type === 'crypto'
      ? (() => { const c = supportedCryptos.find(c => c.id === newAsset.assetId); return c ? `${c.symbol} – ${c.name}` : newAsset.assetId })()
      : (() => { const s = supportedStocks.find(s => s.symbol === newAsset.assetId); return s ? `${s.symbol} – ${s.name}` : newAsset.assetId })()
    : ''

  const options = newAsset.type === 'crypto'
    ? supportedCryptos.filter(c => { const q = assetSearch.toLowerCase(); return !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q) })
    : supportedStocks.filter(s => { const q = assetSearch.toLowerCase(); return !q || s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q) })

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm">Add Asset</h2>
        <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
          <XIcon />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <select
          value={newAsset.type}
          onChange={(e) => { onNewAssetChange({ ...newAsset, type: e.target.value, assetId: '' }); onAssetSearchChange('') }}
          className={inputCls}
        >
          <option value="crypto" className="bg-slate-800">Cryptocurrency</option>
          <option value="stock" className="bg-slate-800">Stock</option>
        </select>
        <div ref={assetDropdownRef} className="relative">
          <input
            type="text"
            placeholder={`Search ${newAsset.type === 'crypto' ? 'crypto' : 'stock'}…`}
            value={assetDropdownOpen ? assetSearch : selectedLabel}
            onFocus={() => { onDropdownOpen(true); onAssetSearchChange('') }}
            onChange={(e) => onAssetSearchChange(e.target.value)}
            className={`${inputCls} w-full`}
          />
          {assetDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg overflow-y-auto max-h-52 z-50 shadow-xl">
              {options.length === 0 ? (
                <div className="px-3 py-2.5 text-white/40 text-sm">No results</div>
              ) : options.map(item => {
                const id = newAsset.type === 'crypto' ? item.id : item.symbol
                const label = `${item.symbol} – ${item.name}`
                return (
                  <button
                    key={id}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onNewAssetChange({ ...newAsset, assetId: id })
                      onDropdownOpen(false)
                      onAssetSearchChange('')
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      newAsset.assetId === id
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <input
          type="number" step="0.00000001" placeholder="Amount *"
          value={newAsset.amount}
          onChange={(e) => onNewAssetChange({ ...newAsset, amount: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="number" step="0.01" placeholder="Purchase price (optional)"
          value={newAsset.purchasePrice}
          onChange={(e) => onNewAssetChange({ ...newAsset, purchasePrice: e.target.value })}
          className={inputCls}
        />
        <input
          type={newAsset.purchaseDate ? 'date' : purchaseDateType}
          placeholder="Purchase date (optional)"
          value={newAsset.purchaseDate}
          onFocus={() => onPurchaseDateType('date')}
          onBlur={() => { if (!newAsset.purchaseDate) onPurchaseDateType('text') }}
          onChange={(e) => onNewAssetChange({ ...newAsset, purchaseDate: e.target.value })}
          className={inputCls}
        />
        <input
          type="text" placeholder="Notes (optional)"
          value={newAsset.notes}
          onChange={(e) => onNewAssetChange({ ...newAsset, notes: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus />
          Add Asset
        </button>
      </div>
    </div>
  )
}

AddAssetForm.propTypes = {
  newAsset: PropTypes.shape({
    assetId: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
    purchasePrice: PropTypes.string.isRequired,
    purchaseDate: PropTypes.string.isRequired,
  }).isRequired,
  assetSearch: PropTypes.string.isRequired,
  assetDropdownOpen: PropTypes.bool.isRequired,
  assetDropdownRef: PropTypes.object.isRequired,
  purchaseDateType: PropTypes.string.isRequired,
  onNewAssetChange: PropTypes.func.isRequired,
  onAssetSearchChange: PropTypes.func.isRequired,
  onDropdownOpen: PropTypes.func.isRequired,
  onPurchaseDateType: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
