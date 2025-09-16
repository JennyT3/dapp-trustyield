/**
 * DeFindex React Hook
 * Provides easy access to DeFindex functionality in React components
 */

import { useState, useEffect, useCallback } from 'react'
import { defindexService, VaultInfo, BlendStrategy, YieldPosition } from '@/services/defindex.service'

interface UseDeFindexReturn {
  // Data
  strategies: BlendStrategy[]
  vaults: VaultInfo[]
  selectedStrategy: BlendStrategy | null
  yieldPosition: YieldPosition | null
  isLoading: boolean
  error: string | null

  // Actions
  loadStrategies: () => Promise<void>
  loadVaults: (publicKey: string) => Promise<void>
  selectStrategy: (strategyId: string) => void
  createVault: (params: {
    strategyId: string
    amount: number
    publicKey: string
    escrowId?: string
  }) => Promise<VaultInfo | null>
  loadYieldPosition: (vaultId: string, publicKey: string) => Promise<void>
  calculateYield: (amount: number, strategyId: string) => Promise<{
    dailyYield: number
    monthlyYield: number
    annualYield: number
    apy: number
  } | null>
  refreshData: () => Promise<void>
}

export function useDeFindex(): UseDeFindexReturn {
  const [strategies, setStrategies] = useState<BlendStrategy[]>([])
  const [vaults, setVaults] = useState<VaultInfo[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<BlendStrategy | null>(null)
  const [yieldPosition, setYieldPosition] = useState<YieldPosition | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStrategies = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const strategiesData = await defindexService.getBlendStrategies()
      setStrategies(strategiesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load strategies'
      setError(errorMessage)
      console.error('Error loading strategies:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadVaults = useCallback(async (publicKey: string) => {
    if (!publicKey) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const vaultsData = await defindexService.getUserVaults(publicKey)
      setVaults(vaultsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vaults'
      setError(errorMessage)
      console.error('Error loading vaults:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectStrategy = useCallback((strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId)
    setSelectedStrategy(strategy || null)
  }, [strategies])

  const createVault = useCallback(async (params: {
    strategyId: string
    amount: number
    publicKey: string
    escrowId?: string
  }): Promise<VaultInfo | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const vault = await defindexService.createVault(params)
      
      // Add the new vault to the list
      setVaults(prev => [...prev, vault])
      
      return vault
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vault'
      setError(errorMessage)
      console.error('Error creating vault:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadYieldPosition = useCallback(async (vaultId: string, publicKey: string) => {
    if (!vaultId || !publicKey) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const position = await defindexService.getYieldPosition(vaultId, publicKey)
      setYieldPosition(position)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load yield position'
      setError(errorMessage)
      console.error('Error loading yield position:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const calculateYield = useCallback(async (amount: number, strategyId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const yieldData = await defindexService.calculateYield(amount, strategyId)
      return yieldData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate yield'
      setError(errorMessage)
      console.error('Error calculating yield:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await loadStrategies()
    // Note: vaults and yield position need publicKey, so they should be loaded separately
  }, [loadStrategies])

  // Load strategies on mount
  useEffect(() => {
    loadStrategies()
  }, [loadStrategies])

  return {
    // Data
    strategies,
    vaults,
    selectedStrategy,
    yieldPosition,
    isLoading,
    error,

    // Actions
    loadStrategies,
    loadVaults,
    selectStrategy,
    createVault,
    loadYieldPosition,
    calculateYield,
    refreshData
  }
}

// Hook for managing yield calculations
export function useYieldCalculator() {
  const [calculations, setCalculations] = useState<Record<string, any>>({})
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateYield = useCallback(async (amount: number, strategyId: string) => {
    const key = `${amount}_${strategyId}`
    
    // Return cached calculation if available
    if (calculations[key]) {
      return calculations[key]
    }

    setIsCalculating(true)
    
    try {
      const result = await defindexService.calculateYield(amount, strategyId)
      setCalculations(prev => ({ ...prev, [key]: result }))
      return result
    } catch (error) {
      console.error('Error calculating yield:', error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [calculations])

  const clearCalculations = useCallback(() => {
    setCalculations({})
  }, [])

  return {
    calculateYield,
    isCalculating,
    clearCalculations
  }
}

// Hook for managing vault operations
export function useVaultManager() {
  const [activeVaults, setActiveVaults] = useState<VaultInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUserVaults = useCallback(async (publicKey: string) => {
    if (!publicKey) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const vaults = await defindexService.getUserVaults(publicKey)
      setActiveVaults(vaults)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vaults'
      setError(errorMessage)
      console.error('Error loading vaults:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createVault = useCallback(async (params: {
    strategyId: string
    amount: number
    publicKey: string
    escrowId?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const vault = await defindexService.createVault(params)
      setActiveVaults(prev => [...prev, vault])
      return vault
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vault'
      setError(errorMessage)
      console.error('Error creating vault:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getVault = useCallback(async (vaultId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const vault = await defindexService.getVault(vaultId)
      return vault
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get vault'
      setError(errorMessage)
      console.error('Error getting vault:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    activeVaults,
    isLoading,
    error,
    loadUserVaults,
    createVault,
    getVault
  }
}
