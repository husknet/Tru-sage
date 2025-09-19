import CryptoJS from 'crypto-js';

export const decryptEmail = (encryptedString) => {
  try {
    const salt = process.env.NEXT_PUBLIC_SALT;
    if (!salt) {
      throw new Error('Decryption salt not configured');
    }

    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedString), salt);
    const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedEmail) {
      throw new Error('Failed to decrypt');
    }
    
    return decryptedEmail;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Invalid or corrupted link');
  }
};

export const encryptEmail = (email) => {
  const salt = process.env.NEXT_PUBLIC_SALT;
  if (!salt) {
    throw new Error('Encryption salt not configured');
  }
  
  return CryptoJS.AES.encrypt(email, salt).toString();
};