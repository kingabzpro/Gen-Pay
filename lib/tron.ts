import { TronWeb } from 'tronweb';

class TronUSDTService {
  private tronWeb: any;

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: {
        'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRON_API_KEY || ''
      }
    });
  }

  // Connect wallet and get address
  async connectWallet(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.tronWeb) {
        this.tronWeb = window.tronWeb;
        const address = await this.tronWeb.trx.getAccount();
        return address.address_base58;
      }
      return null;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  // Send USDT
  async sendUSDT(
    fromAddress: string,
    toAddress: string,
    amount: number,
    privateKey: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // USDT contract address on Tron mainnet
      const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      
      // Get contract instance
      const contract = await this.tronWeb.contract().at(usdtContractAddress);
      
      // Convert amount to USDT units (6 decimals)
      const amountInUnits = Math.floor(amount * 1000000);
      
      // Create transaction
      const transaction = await contract.transfer(toAddress, amountInUnits).send({
        fromAddress,
        privateKey,
        feeLimit: 10000000 // 10 TRX
      });
      
      return {
        success: true,
        txHash: transaction
      };
    } catch (error: any) {
      console.error('USDT transfer error:', error);
      return {
        success: false,
        error: error.message || 'Transfer failed'
      };
    }
  }

  // Get USDT balance
  async getUSDTBalance(address: string): Promise<number> {
    try {
      const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const contract = await this.tronWeb.contract().at(usdtContractAddress);
      
      const balance = await contract.balanceOf(address).call();
      return balance / 1000000; // Convert from units to USDT
    } catch (error) {
      console.error('Error getting USDT balance:', error);
      return 0;
    }
  }

  // Get TRX balance
  async getTRXBalance(address: string): Promise<number> {
    try {
      const account = await this.tronWeb.trx.getAccount(address);
      return account.balance / 1000000; // Convert from sun to TRX
    } catch (error) {
      console.error('Error getting TRX balance:', error);
      return 0;
    }
  }

  // Generate wallet address from private key
  async getAddressFromPrivateKey(privateKey: string): Promise<string> {
    try {
      const account = this.tronWeb.accounts.privateKeyToAccount(privateKey);
      return account.address.base58;
    } catch (error) {
      console.error('Error generating address:', error);
      throw error;
    }
  }

  // Validate Tron address
  isValidTronAddress(address: string): boolean {
    return this.tronWeb.isAddress(address);
  }

  // Convert address to hex format
  addressToHex(address: string): string {
    return this.tronWeb.address.toHex(address);
  }

  // Convert hex to base58 format
  hexToAddress(hex: string): string {
    return this.tronWeb.address.fromHex(hex);
  }
}

export const tronUSDTService = new TronUSDTService();

// Extend window type for TronLink
declare global {
  interface Window {
    tronWeb: any;
  }
}
