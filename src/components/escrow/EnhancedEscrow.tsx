/**
 * Enhanced Escrow Component
 * Combines Trustless Work escrow functionality with DeFindex yield generation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Shield, 
  Users, 
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import { useDeFindex } from '@/hooks/useDeFindex'
import { useWalletConnection } from '@/providers/WalletProvider'
import { VaultInfo } from '@/services/defindex.service'

interface EscrowConfig {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  milestones: string[]
  participants: {
    client: string
    freelancer: string
  }
  deadline: string
  autoYield: boolean
}

interface EnhancedEscrowProps {
  escrowConfig?: EscrowConfig
  onEscrowCreated?: (escrowId: string, vaultId?: string) => void
  onYieldGenerated?: (amount: number, vaultId: string) => void
}

export function EnhancedEscrow({ 
  escrowConfig, 
  onEscrowCreated, 
  onYieldGenerated 
}: EnhancedEscrowProps) {
  const { isConnected, publicKey, isTestnet } = useWalletConnection()
  const { 
    strategies, 
    selectedStrategy, 
    selectStrategy,
    createVault,
    calculateYield
  } = useDeFindex()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: escrowConfig?.title || '',
    description: escrowConfig?.description || '',
    amount: escrowConfig?.amount || 0,
    currency: escrowConfig?.currency || 'USDC',
    milestones: escrowConfig?.milestones || [''],
    clientAddress: escrowConfig?.participants?.client || '',
    freelancerAddress: escrowConfig?.participants?.freelancer || '',
    deadline: escrowConfig?.deadline || '',
    autoYield: escrowConfig?.autoYield ?? true
  })

  const [yieldCalculation, setYieldCalculation] = useState<{
    dailyYield: number
    monthlyYield: number
    annualYield: number
    apy: number
  } | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [createdVault, setCreatedVault] = useState<VaultInfo | null>(null)

  // Calculate yield when amount or strategy changes
  useEffect(() => {
    if (formData.amount > 0 && selectedStrategy && formData.autoYield) {
      calculateYield(formData.amount, selectedStrategy.id).then(result => {
        if (result) {
          setYieldCalculation(result)
        }
      })
    }
  }, [formData.amount, selectedStrategy, formData.autoYield, calculateYield])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }))
  }

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const updateMilestone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? value : milestone
      )
    }))
  }

  const handleCreateEscrow = async () => {
    if (!isConnected || !publicKey) {
      alert('Please connect your wallet first')
      return
    }

    setIsCreating(true)

    try {
      // Step 1: Create DeFindex vault if auto-yield is enabled
      let vaultId: string | undefined
      if (formData.autoYield && selectedStrategy) {
        const vault = await createVault({
          strategyId: selectedStrategy.id,
          amount: formData.amount,
          publicKey,
          escrowId: `escrow_${Date.now()}`
        })

        if (vault) {
          vaultId = vault.id
          setCreatedVault(vault)
          onYieldGenerated?.(formData.amount, vault.id)
        }
      }

      // Step 2: Create Trustless Work escrow
      const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // TODO: Integrate with Trustless Work API
      console.log('Creating escrow with config:', {
        ...formData,
        vaultId,
        escrowId
      })

      onEscrowCreated?.(escrowId, vaultId)
      setStep(4) // Success step

    } catch (error) {
      console.error('Error creating escrow:', error)
      alert('Failed to create escrow. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Connect Wallet Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Please connect your Stellar wallet to create yield-bearing escrows.
          </p>
          <Button onClick={() => window.location.reload()}>
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Tabs value={step.toString()} className="w-full">
        {/* Step 1: Basic Information */}
        <TabsContent value="1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-3 border rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the project and deliverables"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoYield"
                  checked={formData.autoYield}
                  onChange={(e) => handleInputChange('autoYield', e.target.checked)}
                />
                <Label htmlFor="autoYield">Enable automatic yield generation</Label>
                <Info className="h-4 w-4 text-gray-500" />
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Yield Strategy Selection */}
        <TabsContent value="2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>Yield Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.autoYield ? (
                <>
                  <div>
                    <Label>Select DeFindex Strategy</Label>
                    <Select onValueChange={selectStrategy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a yield strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{strategy.name}</span>
                              <Badge variant={strategy.riskLevel === 'low' ? 'default' : strategy.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                                {strategy.expectedApy}% APY
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStrategy && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">
                        {selectedStrategy.name}
                      </h4>
                      <p className="text-green-700 text-sm mb-3">
                        {selectedStrategy.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600">Expected APY:</span>
                          <span className="font-medium ml-2">{selectedStrategy.expectedApy}%</span>
                        </div>
                        <div>
                          <span className="text-green-600">Risk Level:</span>
                          <Badge variant={selectedStrategy.riskLevel === 'low' ? 'default' : selectedStrategy.riskLevel === 'medium' ? 'secondary' : 'destructive'} className="ml-2">
                            {selectedStrategy.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {yieldCalculation && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-3">Projected Returns</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-blue-600">Daily</div>
                          <div className="font-medium">${yieldCalculation.dailyYield.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600">Monthly</div>
                          <div className="font-medium">${yieldCalculation.monthlyYield.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600">Annual</div>
                          <div className="font-medium">${yieldCalculation.annualYield.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Yield generation is disabled for this escrow.
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Milestones and Participants */}
        <TabsContent value="3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Milestones & Participants</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <Input
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    placeholder="Stellar public key"
                  />
                </div>
                <div>
                  <Label htmlFor="freelancerAddress">Freelancer Address</Label>
                  <Input
                    id="freelancerAddress"
                    value={formData.freelancerAddress}
                    onChange={(e) => handleInputChange('freelancerAddress', e.target.value)}
                    placeholder="Stellar public key"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>

              <div>
                <Label>Project Milestones</Label>
                <div className="space-y-2">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={milestone}
                        onChange={(e) => updateMilestone(index, e.target.value)}
                        placeholder={`Milestone ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        disabled={formData.milestones.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addMilestone} className="w-full">
                    Add Milestone
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Escrow'}
                      <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Create Yield-Bearing Escrow?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a secure escrow with automatic yield generation.
                        {formData.autoYield && selectedStrategy && (
                          <div className="mt-2 p-2 bg-green-50 rounded">
                            <p className="text-sm text-green-800">
                              <strong>Yield Strategy:</strong> {selectedStrategy.name}<br/>
                              <strong>Expected APY:</strong> {selectedStrategy.expectedApy}%
                            </p>
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCreateEscrow}>
                        Create Escrow
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Success */}
        <TabsContent value="4" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span>Escrow Created Successfully!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">
                  Your yield-bearing escrow has been created successfully.
                </p>
                {createdVault && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-green-800 mb-2">DeFindex Vault Created</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Vault ID:</strong> {createdVault.id}</div>
                      <div><strong>Strategy:</strong> {createdVault.name}</div>
                      <div><strong>APY:</strong> {createdVault.apy}%</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                  Create Another
                </Button>
                <Button onClick={() => window.open('/dashboard', '_blank')} className="flex-1">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Network Indicator */}
      {isTestnet && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
          🔶 Stellar Testnet
        </div>
      )}
    </div>
  )
}
