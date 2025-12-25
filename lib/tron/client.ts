import { TronWeb } from "tronweb"

const tronWeb = new TronWeb({
  fullHost: "https://api.shasta.trongrid.io",
  privateKey: process.env.TRON_PRIVATE_KEY || '',
})

export default tronWeb

export async function generateTronAddress() {
  const account = await tronWeb.createAccount()
  return account.address
}

export async function checkUSDTBalance(address: string) {
  const contractAddress = "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7"

  try {
    const balance = await tronWeb
      .contract()
      .at(contractAddress)
      .then((contract: any) => contract.balanceOf(address).call())

    return tronWeb.fromSun(balance)
  } catch (error) {
    console.error("Error checking balance:", error)
    return "0"
  }
}

export async function getTransaction(txHash: string) {
  try {
    const transaction = await tronWeb.trx.getTransaction(txHash)
    return transaction
  } catch (error) {
    console.error("Error getting transaction:", error)
    return null
  }
}

export async function sendUSDT(toAddress: string, amount: number) {
  const contractAddress = "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7" // USDT contract on Shasta testnet

  try {
    const contract = await tronWeb.contract().at(contractAddress)
    const amountInSun = tronWeb.toSun(amount)

    const transaction = await contract.transfer(toAddress, amountInSun).send()

    return {
      success: true,
      txHash: transaction,
      message: "USDT sent successfully",
    }
  } catch (error: any) {
    console.error("Error sending USDT:", error)
    return {
      success: false,
      txHash: null,
      message: error.message || "Failed to send USDT",
    }
  }
}

export async function getWalletBalance(address?: string) {
  try {
    const walletAddress = address || tronWeb.defaultAddress.base58
    const balance = await checkUSDTBalance(walletAddress)
    return balance
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    return "0"
  }
}
