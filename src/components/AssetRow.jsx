import PropTypes from 'prop-types'
import { getAssetSymbol, getAssetName, calculateGainLoss } from '../js/portfolio'
import { Edit2, Trash2, Check, XIcon } from './Icons'

export default function AssetRow({
  asset,
  price,
  isEditing,
  editingAsset,
  onStartEditing,
  onDelete,
  onSave,
  onCancel,
  onEditChange,
}) {
  const { value, totalCost, gainLoss, gainLossPercent } = calculateGainLoss(
    asset.amount, price, asset.purchasePrice
  )

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
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
                    onChange={(e) => onEditChange({ ...editingAsset, [key]: e.target.value })}
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
                onClick={() => onSave(asset.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
              >
                <Check />
              </button>
              <button
                onClick={onCancel}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
              >
                <XIcon />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartEditing(asset)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
              >
                <Edit2 />
              </button>
              <button
                onClick={() => onDelete(asset.id)}
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
}

AssetRow.propTypes = {
  asset: PropTypes.shape({
    id: PropTypes.number.isRequired,
    assetId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    purchasePrice: PropTypes.number,
    purchaseDate: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired,
  price: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editingAsset: PropTypes.object.isRequired,
  onStartEditing: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onEditChange: PropTypes.func.isRequired,
}
