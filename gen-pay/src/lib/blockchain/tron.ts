import TronWeb from 'tronweb'

const TRON_GRID_API = process.env.TRON_GRID_API || 'https://api.trongrid.io'
const USDT_CONTRACT = process.env.TRON_NETWORK === 'mainnet' 
  ? 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  : 'TXYZopYOMghyEsLfmwJQoJ2LwGy6JDTV9C' // Shasta testnet

export class TronService {
  private tronWeb: TronWeb

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: TRON_GRID_API,
      headers: { 
        "TRON-PRO-API-KEY": process.env.TRON_GRID_API_KEY 
      }
    })
  }

  async createWallet() {
    const account = this.tronWeb.utils.accounts.generateAccount()
    return {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const contract = await this.tronWeb.contract().at(USDT_CONTRACT)
      const balance = await contract.balanceOf(address).call()
      return this.tronWeb.utils.fromSun(balance) / 1000000 // USDT has 6 decimals
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  async sendUSDT(fromAddress: string, toAddress: string, amount: number, privateKey: string) {
    try {
      const tronWeb = new TronWeb({
        fullHost: TRON_GRID_API,
        privateKey
      })

      const contract = await tronWeb.contract().at(USDT_CONTRACT)
      const amountInSun = amount * 1000000 // Convert to USDT smallest unit

      const transaction = await contract.transfer(toAddress, amountInSun).send({
        feeLimit: 100000000,
        callValue: 0,
      })

      return transaction
    } catch (error) {
      console.error('Error sending USDT:', error)
      throw error
    }
  }

  async getTransactionStatus(txHash: string) {
    try {
      const transaction = await this.tronWeb.trx.getTransaction(txHash)
      return transaction
    } catch (error) {
      console.error('Error getting transaction:', error)
      return null
    }
  }

  validateAddress(address: string): boolean {
    return this.tronWeb.isAddress(address)
  }
}
