/**
 * DeFindex Service
 * Handles all interactions with the DeFindex protocol for yield generation
 */

export interface VaultInfo {
  id: string
  name: string
  strategy: string
  apy: number
  totalValue: number
  isActive: boolean
  createdAt: string
}

export interface BlendStrategy {
  id: string
  name: string
  description: string
  expectedApy: number
  riskLevel: 'low' | 'medium' | 'high'
  minAmount: number
  maxAmount?: number
}

export interface YieldPosition {
  vaultId: string
  amount: number
  currentValue: number
  earned: number
  apy: number
  lastUpdate: string
}

class DeFindexService {
  private baseUrl: string
  private apiKey?: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DEFINDEX_API_URL || 'https://api.defindex.io'
    this.apiKey = process.env.NEXT_PUBLIC_DEFINDEX_API_KEY
  }

  /**
   * Get available Blend strategies for yield generation
   */
  async getBlendStrategies(): Promise<BlendStrategy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/strategies/blend`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch strategies: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching Blend strategies:', error)
      // Return mock data for demo purposes
      return this.getMockStrategies()
    }
  }

  /**
   * Create a new DeFindex vault for yield generation
   */
  async createVault(params: {
    strategyId: string
    amount: number
    publicKey: string
    escrowId?: string
  }): Promise<VaultInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/vaults`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          strategyId: params.strategyId,
          amount: params.amount,
          owner: params.publicKey,
          metadata: {
            escrowId: params.escrowId,
            source: 'trustyield'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create vault: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating vault:', error)
      // Return mock vault for demo purposes
      return this.createMockVault(params)
    }
  }

  /**
   * Get vault information by ID
   */
  async getVault(vaultId: string): Promise<VaultInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/vaults/${vaultId}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch vault: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching vault:', error)
      return this.getMockVault(vaultId)
    }
  }

  /**
   * Get all vaults for a user
   */
  async getUserVaults(publicKey: string): Promise<VaultInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vaults?owner=${publicKey}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user vaults: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user vaults:', error)
      return this.getMockUserVaults(publicKey)
    }
  }

  /**
   * Get yield position for a specific vault
   */
  async getYieldPosition(vaultId: string, publicKey: string): Promise<YieldPosition> {
    try {
      const response = await fetch(`${this.baseUrl}/vaults/${vaultId}/position?owner=${publicKey}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch yield position: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching yield position:', error)
      return this.getMockYieldPosition(vaultId, publicKey)
    }
  }

  /**
   * Calculate potential yield for an amount and strategy
   */
  async calculateYield(amount: number, strategyId: string): Promise<{
    dailyYield: number
    monthlyYield: number
    annualYield: number
    apy: number
  }> {
    try {
      const strategies = await this.getBlendStrategies()
      const strategy = strategies.find(s => s.id === strategyId)
      
      if (!strategy) {
        throw new Error('Strategy not found')
      }

      const apy = strategy.expectedApy / 100
      const annualYield = amount * apy
      const monthlyYield = annualYield / 12
      const dailyYield = annualYield / 365

      return {
        dailyYield,
        monthlyYield,
        annualYield,
        apy: strategy.expectedApy
      }
    } catch (error) {
      console.error('Error calculating yield:', error)
      // Return mock calculation
      return {
        dailyYield: amount * 0.0002,
        monthlyYield: amount * 0.006,
        annualYield: amount * 0.065,
        apy: 6.5
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  // Mock data for demo purposes
  private getMockStrategies(): BlendStrategy[] {
    return [
      {
        id: 'usdc-blend-1',
        name: 'USDC Blend Strategy 1',
        description: 'Conservative USDC yield strategy with low risk',
        expectedApy: 4.2,
        riskLevel: 'low',
        minAmount: 1000
      },
      {
        id: 'usdc-blend-2',
        name: 'USDC Blend Strategy 2',
        description: 'Balanced USDC yield strategy with medium risk',
        expectedApy: 6.8,
        riskLevel: 'medium',
        minAmount: 5000
      },
      {
        id: 'usdc-blend-3',
        name: 'USDC Blend Strategy 3',
        description: 'Aggressive USDC yield strategy with higher risk',
        expectedApy: 9.1,
        riskLevel: 'high',
        minAmount: 10000
      }
    ]
  }

  private createMockVault(params: {
    strategyId: string
    amount: number
    publicKey: string
    escrowId?: string
  }): VaultInfo {
    const strategies = this.getMockStrategies()
    const strategy = strategies.find(s => s.id === params.strategyId)
    
    return {
      id: `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: strategy?.name || 'DeFindex Vault',
      strategy: params.strategyId,
      apy: strategy?.expectedApy || 6.5,
      totalValue: params.amount,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  }

  private getMockVault(vaultId: string): VaultInfo {
    return {
      id: vaultId,
      name: 'Mock DeFindex Vault',
      strategy: 'usdc-blend-2',
      apy: 6.8,
      totalValue: 10000,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  }

  private getMockUserVaults(_publicKey: string): VaultInfo[] {
    return [
      {
        id: `vault_${_publicKey.slice(-8)}_1`,
        name: 'Real Estate Escrow Vault',
        strategy: 'usdc-blend-1',
        apy: 4.2,
        totalValue: 50000,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: `vault_${_publicKey.slice(-8)}_2`,
        name: 'Business M&A Vault',
        strategy: 'usdc-blend-2',
        apy: 6.8,
        totalValue: 100000,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ]
  }

  private getMockYieldPosition(vaultId: string, _publicKey: string): YieldPosition {
    return {
      vaultId,
      amount: 10000,
      currentValue: 10150,
      earned: 150,
      apy: 6.8,
      lastUpdate: new Date().toISOString()
    }
  }
}

export const defindexService = new DeFindexService()
