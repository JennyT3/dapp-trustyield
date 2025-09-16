/**
 * Dashboard Page
 * Shows user's escrows, vaults, and yield statistics
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign, 
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { useWalletConnection, useWalletActions } from '@/providers/WalletProvider'
import { useDeFindex } from '@/hooks/useDeFindex'

export default function Dashboard() {
  const { isConnected, publicKey, walletName, isTestnet } = useWalletConnection()
  const { disconnect } = useWalletActions()
  const { vaults, loadVaults } = useDeFindex()

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isConnected && publicKey) {
      loadVaults(publicKey)
    }
  }, [isConnected, publicKey, loadVaults])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please connect your wallet to view your dashboard.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const mockStats = {
    totalValueLocked: 125000,
    activeEscrows: 3,
    totalYieldEarned: 1250,
    averageApy: 6.2
  }

  const mockEscrows = [
    {
      id: 'escrow_1',
      title: 'Real Estate Transaction',
      amount: 50000,
      currency: 'USDC',
      status: 'active',
      yieldEarned: 450,
      apy: 4.2,
      vaultId: 'vault_1'
    },
    {
      id: 'escrow_2',
      title: 'Business M&A Deal',
      amount: 100000,
      currency: 'USDC',
      status: 'active',
      yieldEarned: 800,
      apy: 6.8,
      vaultId: 'vault_2'
    },
    {
      id: 'escrow_3',
      title: 'Marketplace Transaction',
      amount: 25000,
      currency: 'USDC',
      status: 'completed',
      yieldEarned: 150,
      apy: 6.5,
      vaultId: 'vault_3'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">TrustYield Dashboard</div>
              {isTestnet && (
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Testnet
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                {walletName} Connected
              </Badge>
              <div className="text-white text-sm font-mono">
                {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
              </div>
              <Button variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value Locked</p>
                  <p className="text-2xl font-bold text-white">${mockStats.totalValueLocked.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Escrows</p>
                  <p className="text-2xl font-bold text-white">{mockStats.activeEscrows}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Yield Earned</p>
                  <p className="text-2xl font-bold text-white">${mockStats.totalYieldEarned.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Average APY</p>
                  <p className="text-2xl font-bold text-white">{mockStats.averageApy}%</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="escrows">Escrows</TabsTrigger>
            <TabsTrigger value="vaults">DeFindex Vaults</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEscrows.slice(0, 3).map((escrow) => (
                      <div key={escrow.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{escrow.title}</p>
                          <p className="text-gray-400 text-sm">${escrow.amount.toLocaleString()} {escrow.currency}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={escrow.status === 'active' ? 'default' : 'secondary'}>
                            {escrow.status}
                          </Badge>
                          <p className="text-green-400 text-sm">+${escrow.yieldEarned}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Escrow
                  </Button>
                  <Button variant="outline" className="w-full">
                    View All Vaults
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Escrows Tab */}
          <TabsContent value="escrows" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Your Escrows</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Escrow
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {mockEscrows.map((escrow) => (
                <Card key={escrow.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{escrow.title}</h3>
                          <Badge variant={escrow.status === 'active' ? 'default' : 'secondary'}>
                            {escrow.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Amount</p>
                            <p className="text-white font-medium">${escrow.amount.toLocaleString()} {escrow.currency}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Yield Earned</p>
                            <p className="text-green-400 font-medium">+${escrow.yieldEarned}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">APY</p>
                            <p className="text-white font-medium">{escrow.apy}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Vault ID</p>
                            <p className="text-white font-mono text-xs">{escrow.vaultId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vaults Tab */}
          <TabsContent value="vaults" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">DeFindex Vaults</h2>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Vault
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {vaults.map((vault) => (
                <Card key={vault.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
                          <Badge variant={vault.isActive ? 'default' : 'secondary'}>
                            {vault.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Strategy</p>
                            <p className="text-white font-medium">{vault.strategy}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Value</p>
                            <p className="text-white font-medium">${vault.totalValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">APY</p>
                            <p className="text-green-400 font-medium">{vault.apy}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Created</p>
                            <p className="text-white text-xs">{new Date(vault.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Network Indicator */}
      {isTestnet && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
          🔶 Stellar Testnet
        </div>
      )}
    </div>
  )
}
