import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;
if (!MASTER_KEY) {
  throw new Error('ENCRYPTION_MASTER_KEY is not set');
}

const key = Buffer.from(MASTER_KEY, 'base64'); // 32 bytes for AES-256

export function encryptPrivateKey(privateKey: string): string {
  const iv = randomBytes(16); // Initialization vector
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv + authTag + encrypted data (all hex)
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

export function decryptPrivateKey(encryptedData: string): string {
  const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
  const authTag = Buffer.from(encryptedData.slice(32, 64), 'hex');
  const encrypted = encryptedData.slice(64);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateMasterKey(): string {
  return randomBytes(32).toString('base64');
}
