const { Client, Databases } = require('appwrite');
const TronWeb = require('tronweb');

module.exports = async (req, res) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    const { txHash, status, blockNumber } = JSON.parse(req.body);
    
    if (!txHash) {
      return res.json({
        success: false,
        error: 'Missing transaction hash'
      });
    }

    // Initialize TronWeb for transaction verification
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY }
    });

    // Verify transaction on Tron network
    const transactionInfo = await tronWeb.trx.getTransactionInfo(txHash);
    
    if (!transactionInfo) {
      return res.json({
        success: false,
        error: 'Transaction not found on Tron network'
      });
    }

    // Find transaction in our database
    const transactions = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'transactions',
      [appwrite.Query.equal('txHash', txHash)]
    );

    if (transactions.documents.length === 0) {
      return res.json({
        success: false,
        error: 'Transaction not found in database'
      });
    }

    const transaction = transactions.documents[0];
    
    // Check if transaction is confirmed
    const isConfirmed = transactionInfo.receipt && transactionInfo.receipt.result === 'SUCCESS';
    const newStatus = isConfirmed ? 'completed' : 'pending';

    // Update transaction status
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'transactions',
      transaction.$id,
      {
        status: newStatus,
        completedAt: isConfirmed ? new Date().toISOString() : undefined
      }
    );

    // If transaction is for payment, update payment status
    if (transaction.type === 'receive' && isConfirmed) {
      await updatePaymentStatus(databases, transaction.merchantId, transaction.amount, txHash);
      
      // Update merchant wallet balance
      await updateWalletBalance(databases, transaction.merchantId, transaction.amount);
    }

    // Call merchant webhook if configured
    if (isConfirmed && transaction.merchantId) {
      await callMerchantWebhook(databases, transaction.merchantId, {
        type: 'payment_received',
        transactionId: transaction.$id,
        amount: transaction.amount,
        txHash,
        status: 'completed'
      });
    }

    return res.json({
      success: true,
      status: newStatus,
      transactionId: transaction.$id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.json({
      success: false,
      error: error.message
    });
  }
};

async function updatePaymentStatus(databases, merchantId, amount, txHash) {
  try {
    // Find pending payment for this merchant and amount
    const payments = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'payments',
      [
        appwrite.Query.equal('merchantId', merchantId),
        appwrite.Query.equal('amount', amount),
        appwrite.Query.equal('status', 'pending')
      ]
    );

    if (payments.documents.length > 0) {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID || 'genpay',
        'payments',
        payments.documents[0].$id,
        {
          status: 'paid',
          txHash
        }
      );
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

async function updateWalletBalance(databases, merchantId, amountChange) {
  try {
    const wallets = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'prepaid_wallets',
      [appwrite.Query.equal('merchantId', merchantId)]
    );
    
    if (wallets.documents.length > 0) {
      const wallet = wallets.documents[0];
      const newBalance = wallet.balance + amountChange;
      
      const ledger = wallet.ledger || [];
      ledger.push({
        type: amountChange > 0 ? 'credit' : 'debit',
        amount: Math.abs(amountChange),
        txHash,
        timestamp: new Date().toISOString()
      });
      
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID || 'genpay',
        'prepaid_wallets',
        wallet.$id,
        {
          balance: newBalance,
          ledger
        }
      );
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
  }
}

async function callMerchantWebhook(databases, merchantId, payload) {
  try {
    // Get merchant details
    const merchants = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'merchants',
      [appwrite.Query.equal('$id', merchantId)]
    );

    if (merchants.documents.length > 0 && merchants.documents[0].webhookUrl) {
      const merchant = merchants.documents[0];
      
      // Make HTTP request to merchant webhook
      const axios = require('axios');
      await axios.post(merchant.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-GenPay-Signature': generateSignature(payload, merchant.apiKey)
        }
      });
    }
  } catch (error) {
    console.error('Error calling merchant webhook:', error);
  }
}

function generateSignature(payload, apiKey) {
  // Simple signature generation - in production, use proper HMAC
  const crypto = require('crypto');
  return crypto.createHmac('sha256', apiKey)
    .update(JSON.stringify(payload))
    .digest('hex');
}
