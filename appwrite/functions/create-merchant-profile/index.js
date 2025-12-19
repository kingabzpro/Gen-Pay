const { Client, Databases } = require('appwrite');

module.exports = async (req, res) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const { userId, businessName } = req.variables;

    if (!userId || !businessName) {
      return res.json({
        success: false,
        error: 'Missing required parameters: userId, businessName'
      });
    }

    // Generate API key for the merchant
    const apiKey = generateApiKey();

    // Create merchant profile
    const merchant = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'merchants',
      'unique()',
      {
        userId,
        businessName,
        apiKey,
        createdAt: new Date().toISOString()
      }
    );

    // Create initial prepaid wallet
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID || 'genpay',
      'prepaid_wallets',
      'unique()',
      {
        merchantId: merchant.$id,
        balance: 0,
        ledger: []
      }
    );

    return res.json({
      success: true,
      merchant: {
        id: merchant.$id,
        businessName: merchant.businessName,
        apiKey: merchant.apiKey
      }
    });

  } catch (error) {
    console.error('Error creating merchant profile:', error);
    return res.json({
      success: false,
      error: error.message
    });
  }
};

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'gp_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
