/**
 * Wallet Provider
 * Provides wallet connection functionality with Freighter integration
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  // Connection state
  isConnected: boolean
  publicKey: string | null
  walletName: string | null
  network: 'testnet' | 'mainnet' | null
  
  // Actions
  connectWallet: () => Promise<boolean>
  disconnect: () => void
  switchNetwork: (network: 'testnet' | 'mainnet') => Promise<boolean>
  
  // Loading states
  isConnecting: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const [network, setNetwork] = useState<'testnet' | 'mainnet' | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    if (typeof window === 'undefined') return

    try {
      // Check if Freighter is available
      if (!(window as unknown as { freighter?: unknown }).freighter) {
        return
      }

      const freighter = (window as unknown as { freighter: any }).freighter
      const isConnected = await freighter.isConnected()
      
      if (isConnected) {
        const publicKey = await freighter.getPublicKey()
        const network = await freighter.getNetwork()
        
        setIsConnected(true)
        setPublicKey(publicKey)
        setWalletName('Freighter')
        setNetwork(network === 'TESTNET' ? 'testnet' : 'mainnet')
      }
    } catch (error) {
      console.error('Error checking existing connection:', error)
    }
  }

  const connectWallet = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      setError('Wallet connection not available in this environment')
      return false
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Check if Freighter is available
      if (!(window as unknown as { freighter?: unknown }).freighter) {
        throw new Error('Freighter wallet not installed. Please install it from https://freighter.app')
      }

      const freighter = (window as unknown as { freighter: any }).freighter

      // Request access
      const hasAccess = await freighter.requestAccess()
      if (!hasAccess) {
        throw new Error('User denied access to Freighter wallet')
      }

      // Get public key
      const publicKey = await freighter.getPublicKey()
      if (!publicKey) {
        throw new Error('Failed to get public key from Freighter')
      }

      // Get current network
      const currentNetwork = await freighter.getNetwork()
      
      // Set network to testnet if not already set
      if (currentNetwork !== 'TESTNET') {
        await freighter.setAllowedNetworks(['testnet'])
        await freighter.setNetwork('TESTNET')
      }

      setIsConnected(true)
      setPublicKey(publicKey)
      setWalletName('Freighter')
      setNetwork('testnet')
      
      console.log('Successfully connected to Freighter:', {
        publicKey,
        network: 'testnet'
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setError(errorMessage)
      console.error('Error connecting wallet:', error)
      
      // Reset state on error
      setIsConnected(false)
      setPublicKey(null)
      setWalletName(null)
      setNetwork(null)
      
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setPublicKey(null)
    setWalletName(null)
    setNetwork(null)
    setError(null)
    
    console.log('Wallet disconnected')
  }

  const switchNetwork = async (targetNetwork: 'testnet' | 'mainnet'): Promise<boolean> => {
    if (!isConnected || !(window as unknown as { freighter?: unknown }).freighter) {
      setError('Wallet not connected')
      return false
    }

    setIsConnecting(true)
    setError(null)

    try {
      const freighter = (window as unknown as { freighter: any }).freighter
      const networkParam = targetNetwork.toUpperCase()
      
      await freighter.setAllowedNetworks([targetNetwork])
      await freighter.setNetwork(networkParam)
      
      setNetwork(targetNetwork)
      console.log(`Switched to ${targetNetwork} network`)
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network'
      setError(errorMessage)
      console.error('Error switching network:', error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const value: WalletContextType = {
    // Connection state
    isConnected,
    publicKey,
    walletName,
    network,
    
    // Actions
    connectWallet,
    disconnect,
    switchNetwork,
    
    // Loading states
    isConnecting,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Hook for getting wallet connection status
export function useWalletConnection() {
  const { isConnected, publicKey, walletName, network } = useWallet()
  
  return {
    isConnected,
    publicKey,
    walletName,
    network,
    isTestnet: network === 'testnet',
    isMainnet: network === 'mainnet'
  }
}

// Hook for wallet actions
export function useWalletActions() {
  const { connectWallet, disconnect, switchNetwork, isConnecting, error } = useWallet()
  
  return {
    connectWallet,
    disconnect,
    switchNetwork,
    isConnecting,
    error
  }
}
