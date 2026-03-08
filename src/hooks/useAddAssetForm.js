import { useState, useEffect, useRef } from 'react'

const EMPTY_ASSET = { assetId: '', amount: '', type: 'crypto', notes: '', purchasePrice: '', purchaseDate: '' }

export default function useAddAssetForm() {
  const [newAsset, setNewAsset] = useState(EMPTY_ASSET)
  const [purchaseDateType, setPurchaseDateType] = useState('text')
  const [assetSearch, setAssetSearch] = useState('')
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false)
  const assetDropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(e.target)) {
        setAssetDropdownOpen(false)
        setAssetSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const resetForm = () => {
    setNewAsset(EMPTY_ASSET)
    setAssetSearch('')
    setAssetDropdownOpen(false)
    setPurchaseDateType('text')
  }

  return {
    newAsset, setNewAsset,
    purchaseDateType, setPurchaseDateType,
    assetSearch, setAssetSearch,
    assetDropdownOpen, setAssetDropdownOpen,
    assetDropdownRef,
    resetForm,
  }
}
