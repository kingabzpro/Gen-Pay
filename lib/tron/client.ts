import { TronWeb } from "tronweb";

const tronWeb = new TronWeb({
  fullHost: "https://api.shasta.trongrid.io",
  privateKey: process.env.TRON_PRIVATE_KEY,
});

export default tronWeb;

export async function generateTronAddress() {
  const account = await tronWeb.createAccount();
  return account.address;
}

export async function checkUSDTBalance(address: string) {
  const contractAddress = "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7";

  try {
    const balance = await tronWeb.contract().at(contractAddress)
      .then((contract: any) => contract.balanceOf(address).call());

    return tronWeb.fromSun(balance);
  } catch (error) {
    console.error("Error checking balance:", error);
    return "0";
  }
}

export async function getTransaction(txHash: string) {
  try {
    const transaction = await tronWeb.trx.getTransaction(txHash);
    return transaction;
  } catch (error) {
    console.error("Error getting transaction:", error);
    return null;
  }
}
