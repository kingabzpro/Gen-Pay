// Server-side Supabase client
import { encryptPrivateKey, decryptPrivateKey } from '@/lib/crypto/encryption';

const USDT_CONTRACT = process.env.TRON_USDT_CONTRACT_NILE || 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7';

export interface WalletData {
  id: string;
  userId: string;
  address: string;
  balanceUSDT: number;
  balanceTRX: number;
}

async function getTronWeb() {
  const TronWeb = (await import('tronweb')).default;
  return new TronWeb({
    fullHost: process.env.NEXT_PUBLIC_TRON_NILE_RPC || 'https://api.nileex.io',
    headers: {
      'TRON-PRO-API-KEY': process.env.TRON_API_KEY || ''
    }
  });
}

export async function createWalletForUser(userId: string): Promise<WalletData> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const tronWeb = await getTronWeb();

  // Generate new account
  const account = await tronWeb.createAccount();
  const address = account.address.base58;
  const privateKey = account.privateKey;

  // Encrypt private key
  const encryptedPrivateKey = encryptPrivateKey(privateKey);

  // Store in database
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      address: address,
      encrypted_private_key: encryptedPrivateKey
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    address: data.address,
    balanceUSDT: 0,
    balanceTRX: 0
  };
}

export async function getWalletByUserId(userId: string): Promise<WalletData | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    address: data.address,
    balanceUSDT: parseFloat(data.balance_usdt),
    balanceTRX: parseFloat(data.balance_trx)
  };
}

export async function getUSDTBalance(address: string): Promise<number> {
  try {
    const tronWeb = await getTronWeb();
    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const balance = await contract.balanceOf(address).call();
    return parseFloat(tronWeb.fromSun(balance));
  } catch (error) {
    console.error('Error fetching USDT balance:', error);
    return 0;
  }
}

export async function getTRXBalance(address: string): Promise<number> {
  try {
    const tronWeb = await getTronWeb();
    const account = await tronWeb.trx.getAccount(address);
    return parseFloat(tronWeb.fromSun(account.balance || 0));
  } catch (error) {
    console.error('Error fetching TRX balance:', error);
    return 0;
  }
}

export async function syncWalletBalance(walletId: string): Promise<void> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const tronWeb = await getTronWeb();

  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', walletId)
    .single();

  if (walletError) throw walletError;

  const [usdtBalance, trxBalance] = await Promise.all([
    getUSDTBalance(wallet.address),
    getTRXBalance(wallet.address)
  ]);

  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      balance_usdt: usdtBalance,
      balance_trx: trxBalance
    })
    .eq('id', walletId);

  if (updateError) throw updateError;
}

export async function sendUSDT(
  fromWalletId: string,
  toAddress: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const tronWeb = await getTronWeb();

  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', fromWalletId)
    .single();

  if (walletError) throw walletError;

  // Decrypt private key
  const privateKey = decryptPrivateKey(wallet.encrypted_private_key);

  try {
    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const amountInSun = tronWeb.toSun(amount);

    const transaction = await contract.transfer(toAddress, amountInSun).send({
      fromAddress: wallet.address,
      privateKey,
      feeLimit: 10000000 // 10 TRX
    });

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: wallet.user_id,
        wallet_id: fromWalletId,
        tx_hash: transaction,
        type: 'send',
        amount_usdt: amount,
        from_address: wallet.address,
        to_address: toAddress,
        status: 'pending'
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
