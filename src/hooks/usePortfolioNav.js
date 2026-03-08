import { useState, useEffect, useRef } from 'react'

export default function usePortfolioNav() {
  const [selectedPortfolio, setSelectedPortfolio] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [creatingPortfolio, setCreatingPortfolio] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const newPortfolioInputRef = useRef(null)

  const [dashboardCreating, setDashboardCreating] = useState(false)
  const [dashboardPortfolioName, setDashboardPortfolioName] = useState('')
  const dashboardInputRef = useRef(null)

  const [editingId, setEditingId] = useState(null)
  const [editingAsset, setEditingAsset] = useState({})

  useEffect(() => {
    if (creatingPortfolio && newPortfolioInputRef.current) {
      newPortfolioInputRef.current.focus()
    }
  }, [creatingPortfolio])

  useEffect(() => {
    if (dashboardCreating && dashboardInputRef.current) {
      dashboardInputRef.current.focus()
    }
  }, [dashboardCreating])

  useEffect(() => {
    setShowAddForm(false)
    setEditingId(null)
    setEditingAsset({})
  }, [selectedPortfolio])

  const navigateToPortfolio = (name) => {
    setSelectedPortfolio(name)
    setCreatingPortfolio(false)
    setNewPortfolioName('')
    setDashboardCreating(false)
    setDashboardPortfolioName('')
    setShowAddForm(true)
  }

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

  return {
    selectedPortfolio, setSelectedPortfolio,
    showAddForm, setShowAddForm,
    creatingPortfolio, setCreatingPortfolio,
    newPortfolioName, setNewPortfolioName,
    newPortfolioInputRef,
    dashboardCreating, setDashboardCreating,
    dashboardPortfolioName, setDashboardPortfolioName,
    dashboardInputRef,
    editingId,
    editingAsset, setEditingAsset,
    navigateToPortfolio,
    startEditing,
    cancelEditing,
  }
}
