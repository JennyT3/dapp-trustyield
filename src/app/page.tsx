'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, TrendingUp, Zap, DollarSign, Users, Clock, Wallet, ExternalLink } from 'lucide-react'

// Stellar Wallet Types
interface StellarWallet {
  name: string
  icon: string
  isInstalled: boolean
  connect: () => Promise<string>
}

export default function TrustYieldHome() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [selectedEscrowType, setSelectedEscrowType] = useState<string | null>(null)
  const [stellarWallets, setStellarWallets] = useState<StellarWallet[]>([])

  // Initialize Stellar Wallets
  useEffect(() => {
    const checkWallets = () => {
      const wallets: StellarWallet[] = [
        {
          name: 'Freighter',
          icon: '🚀',
          isInstalled: typeof window !== 'undefined' && !!(window as unknown as { freighter?: unknown }).freighter,
          connect: async () => {
            if (typeof window !== 'undefined' && (window as unknown as { freighter?: unknown }).freighter) {
              try {
                const freighter = (window as unknown as { freighter: any }).freighter
                // Check if Freighter is connected
                const isConnected = await freighter.isConnected()
                if (!isConnected) {
                  // Request access to Freighter
                  await freighter.requestAccess()
                }
                
                // Get public key
                const publicKey = await freighter.getPublicKey()
                if (!publicKey) {
                  throw new Error('No public key available')
                }
                
                // Set network to testnet
                await freighter.setAllowedNetworks(['testnet'])
                
                return publicKey
              } catch (error) {
                console.error('Freighter connection error:', error)
                throw error
              }
            }
            throw new Error('Freighter not installed')
          }
        },
        {
          name: 'Albedo',
          icon: '⭐',
          isInstalled: typeof window !== 'undefined' && !!(window as unknown as { albedo?: unknown }).albedo,
          connect: async () => {
            if (typeof window !== 'undefined' && (window as unknown as { albedo?: unknown }).albedo) {
              const albedo = (window as unknown as { albedo: any }).albedo
              const result = await albedo.publicKey()
              return result.pubkey
            }
            throw new Error('Albedo not installed')
          }
        },
        {
          name: 'xBull',
          icon: '🐂',
          isInstalled: typeof window !== 'undefined' && !!(window as unknown as { xBullWalletConnect?: unknown }).xBullWalletConnect,
          connect: async () => {
            if (typeof window !== 'undefined' && (window as unknown as { xBullWalletConnect?: unknown }).xBullWalletConnect) {
              const xBull = (window as unknown as { xBullWalletConnect: any }).xBullWalletConnect
              const result = await xBull.connect()
              return result.publicKey
            }
            throw new Error('xBull not installed')
          }
        },
        {
          name: 'Rabet',
          icon: '🎯',
          isInstalled: typeof window !== 'undefined' && !!(window as unknown as { rabet?: unknown }).rabet,
          connect: async () => {
            if (typeof window !== 'undefined' && (window as unknown as { rabet?: unknown }).rabet) {
              const rabet = (window as unknown as { rabet: any }).rabet
              const result = await rabet.connect()
              return result.publicKey
            }
            throw new Error('Rabet not installed')
          }
        }
      ]
      setStellarWallets(wallets)
    }

    checkWallets()
  }, [])

  const connectStellarWallet = async (wallet: StellarWallet) => {
    try {
      const publicKey = await wallet.connect()
      setConnectedWallet(wallet.name)
      setPublicKey(publicKey)
      console.log(`Successfully connected to ${wallet.name}:`, publicKey)
    } catch (error) {
      console.error(`Failed to connect ${wallet.name}:`, error)
      
      // Better error handling with user feedback
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          alert('Connection cancelled by user')
          return
        } else if (error.message.includes('not installed')) {
          alert(`${wallet.name} wallet is not installed. Please install it first.`)
          return
        } else if (error.message.includes('not connected')) {
          alert(`Please connect your ${wallet.name} wallet first.`)
          return
        }
      }
      
      // Fallback for demo purposes - only for Freighter if it fails
      if (wallet.name === 'Freighter') {
        console.log('Using demo mode for Freighter')
        const demoKey = 'GDEMO...STELLAR...ADDRESS...DEMO123'
        setConnectedWallet(wallet.name + ' (Demo)')
        setPublicKey(demoKey)
      }
    }
  }

  const disconnect = () => {
    setConnectedWallet(null)
    setPublicKey(null)
  }

  const escrowTypes = [
    {
      id: 'real-estate',
      title: 'Real Estate',
      description: 'High-value property transactions with automatic yield generation',
      minAmount: '50,000 USDC',
      avgYield: '4-8% APY',
      icon: '🏠',
      duration: '30-90 days',
      blockchain: 'Stellar Network'
    },
    {
      id: 'business',
      title: 'Business M&A',
      description: 'Secure business acquisitions with productive capital',
      minAmount: '100,000 USDC',
      avgYield: '5-9% APY',
      icon: '🤝',
      duration: '60-120 days',
      blockchain: 'Stellar Network'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'High-volume, low-value transactions with recurring yield',
      minAmount: '1,000 USDC',
      avgYield: '3-6% APY',
      icon: '🛒',
      duration: '7-30 days',
      blockchain: 'Stellar Network'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Stellar Security',
      description: 'Built on Stellar blockchain with multi-signature smart contract protection'
    },
    {
      icon: TrendingUp,
      title: 'DeFindex Yield',
      description: 'Earn 4-8% APY through automated DeFindex strategies on Stellar'
    },
    {
      icon: Zap,
      title: 'Instant Integration',
      description: 'Add yield-bearing escrows to your platform with Stellar SDK'
    },
    {
      icon: DollarSign,
      title: 'Low Fees',
      description: 'Stellar network fees + yield-sharing model = ultra-low costs'
    }
  ]

  const stats = [
    { label: 'Total Value Locked', value: '$12.5M', change: '+23%', note: 'Testnet Assets' },
    { label: 'Active Escrows', value: '1,247', change: '+15%', note: 'Live Contracts' },
    { label: 'Average Yield', value: '6.2%', change: '+0.4%', note: 'DeFindex APY' },
    { label: 'Stellar Integrations', value: '23', change: '+8', note: 'Platforms' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">TrustYield</div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Stellar + DeFindex
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => window.open('https://docs.trustlesswork.com/trustless-work', '_blank')}
              >
                Docs
              </Button>
              {connectedWallet ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    {connectedWallet} Connected
                  </Badge>
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="relative group">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Stellar Wallet
                  </Button>
                  
                  {/* Wallet Dropdown */}
                  <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <h3 className="text-white text-sm font-semibold mb-3">Choose Stellar Wallet</h3>
                      <div className="space-y-2">
                        {stellarWallets.map((wallet) => (
                          <button
                            key={wallet.name}
                            onClick={() => connectStellarWallet(wallet)}
                            className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                              wallet.isInstalled 
                                ? 'hover:bg-white/10 text-white' 
                                : 'text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!wallet.isInstalled}
                          >
                            <span className="text-lg">{wallet.icon}</span>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">{wallet.name}</div>
                              <div className="text-xs text-gray-400">
                                {wallet.isInstalled ? 'Ready to connect' : 'Not installed'}
                              </div>
                            </div>
                            {!wallet.isInstalled && <ExternalLink className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">
                          Don&apos;t have a Stellar wallet? Install Freighter for the best experience.
                        </p>
                        <p className="text-xs text-orange-400">
                          🔶 All transactions will be on Stellar Testnet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Connected Wallet Info */}
      {connectedWallet && publicKey && (
        <div className="bg-green-900/20 border-b border-green-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  Connected to {connectedWallet}
                </span>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                  Testnet
                </Badge>
              </div>
              <div className="text-white text-sm font-mono">
                {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Stellar Escrows That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Generate Yield
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The first yield-bearing escrow infrastructure on Stellar. Your USDC earns returns 
            through DeFindex while securely held in Trustless Work smart contracts.
          </p>
          
          {/* Testnet Notice */}
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 bg-orange-400 rounded-full"></div>
              <span className="text-orange-400 text-sm font-medium">
                Currently running on Stellar Testnet - Safe for testing
              </span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-xs text-green-400 mb-1">{stat.change}</div>
                <div className="text-xs text-gray-500">{stat.note}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!connectedWallet}
              onClick={() => window.location.href = connectedWallet ? '/dashboard' : '#'}
            >
              {connectedWallet ? 'Launch Dashboard' : 'Connect Wallet First'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => window.open('https://github.com/Trustless-Work/dapp-trustyield', '_blank')}
            >
              View Demo
            </Button>
            {connectedWallet && (
              <Button 
                size="lg" 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={() => window.location.href = '/create-escrow'}
              >
                Create Escrow
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            Why Choose TrustYield on Stellar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow Types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Stellar Escrow Type
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              All powered by Stellar blockchain with automatic DeFindex yield generation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {escrowTypes.map((type) => (
              <Card 
                key={type.id} 
                className={`bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  selectedEscrowType === type.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedEscrowType(type.id)}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <CardTitle className="text-white">{type.title}</CardTitle>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {type.blockchain}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-center">{type.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Min Amount:</span>
                      <span className="text-white font-semibold">{type.minAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Expected Yield:</span>
                      <span className="text-green-400 font-semibold">{type.avgYield}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Avg Duration:</span>
                      <span className="text-white font-semibold">{type.duration}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={!connectedWallet}
                  >
                    {connectedWallet ? 'Create Stellar Escrow' : 'Connect Stellar Wallet'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            How It Works on Stellar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">1. Create Stellar Escrow</h3>
              <p className="text-gray-400">Connect your Stellar wallet and set up escrow terms with automatic DeFindex integration</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">2. Earn Stellar Yield</h3>
              <p className="text-gray-400">USDC automatically generates returns through DeFindex Blend strategies on Stellar</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">3. Release + Yield</h3>
              <p className="text-gray-400">Complete milestones and receive both principal and accumulated yield in your Stellar wallet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="text-2xl font-bold text-white">TrustYield</div>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Built on Stellar
              </Badge>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="https://docs.trustlesswork.com/trustless-work" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Stellar Docs
              </a>
              <a 
                href="https://github.com/Trustless-Work/dapp-trustyield" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://github.com/Trustless-Work/dapp-trustyield" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Discord
              </a>
              <a 
                href="https://x.com/TrustlessWork" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 Trustless Work. Built on Stellar Network with DeFindex integration.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
