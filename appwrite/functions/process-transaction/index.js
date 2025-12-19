const { Client, Databases } = require('appwrite');
const TronWeb = require('tronweb');

module.exports = async (req, res) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    const { merchantId, type, amount, toAddress, fromAddress, description } = JSON.parse(req.body);
    
    if (!merchantId || !type || !amount || !toAddress) {
      return res.json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Initialize TronWeb
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY }
    });

    // Create transaction record
    const transaction = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'transactions',
      'unique()',
      {
        merchantId,
        type,
        amount: parseFloat(amount),
        currency: 'USDT',
        status: 'pending',
        fromAddress,
        toAddress,
        description,
        createdAt: new Date().toISOString()
      }
    );

    if (type === 'send') {
      // Handle USDT sending
      const result = await sendUSDT(tronWeb, fromAddress, toAddress, amount);
      
      if (result.success) {
        // Update transaction with TX hash
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID || 'genpay',
          'transactions',
          transaction.$id,
          {
            txHash: result.txHash,
            status: 'completed',
            completedAt: new Date().toISOString()
          }
        );

        // Update merchant wallet balance
        await updateWalletBalance(databases, merchantId, -parseFloat(amount));

        return res.json({
          success: true,
          transactionId: transaction.$id,
          txHash: result.txHash,
          status: 'completed'
        });
      } else {
        // Mark transaction as failed
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID || 'genpay',
          'transactions',
          transaction.$id,
          { status: 'failed' }
        );

        return res.json({
          success: false,
          error: result.error,
          transactionId: transaction.$id
        });
      }
    } else {
      // For receive transactions, just mark as pending
      return res.json({
        success: true,
        transactionId: transaction.$id,
        status: 'pending'
      });
    }

  } catch (error) {
    console.error('Error processing transaction:', error);
    return res.json({
      success: false,
      error: error.message
    });
  }
};

async function sendUSDT(tronWeb, fromAddress, toAddress, amount) {
  try {
    // USDT contract address on Tron mainnet
    const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    
    // Get contract instance
    const contract = await tronWeb.contract().at(usdtContractAddress);
    
    // Convert amount to USDT units (6 decimals)
    const amountInUnits = Math.floor(amount * 1000000);
    
    // Send transaction
    const transaction = await contract.transfer(toAddress, amountInUnits).send({
      fromAddress,
      feeLimit: 10000000 // 10 TRX
    });
    
    return {
      success: true,
      txHash: transaction
    };
  } catch (error) {
    console.error('USDT transfer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function updateWalletBalance(databases, merchantId, amountChange) {
  try {
    // Get current wallet
    const wallets = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'prepaid_wallets',
      [appwrite.Query.equal('merchantId', merchantId)]
    );
    
    if (wallets.documents.length > 0) {
      const wallet = wallets.documents[0];
      const newBalance = wallet.balance + amountChange;
      
      // Add to ledger
      const ledger = wallet.ledger || [];
      ledger.push({
        type: amountChange > 0 ? 'credit' : 'debit',
        amount: Math.abs(amountChange),
        timestamp: new Date().toISOString()
      });
      
      // Update wallet
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
