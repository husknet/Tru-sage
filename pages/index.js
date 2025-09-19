import { useState } from 'react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';

export default function Home() {
  const [email, setEmail] = useState('');
  const [encrypted, setEncrypted] = useState('');

  const handleEncrypt = () => {
    if (!email) return;
    
    try {
      const salt = process.env.NEXT_PUBLIC_SALT;
      if (!salt) {
        alert('Encryption salt not configured');
        return;
      }
      
      const encryptedEmail = CryptoJS.AES.encrypt(email, salt).toString();
      const encodedEmail = encodeURIComponent(encryptedEmail);
      setEncrypted(encodedEmail);
    } catch (error) {
      console.error('Encryption error:', error);
      alert('Failed to encrypt email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tru Encryption Demo</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Email to encrypt
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>
        
        <button
          onClick={handleEncrypt}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Encrypt Email
        </button>
        
        {encrypted && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Encrypted string:</p>
            <code className="block p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {encrypted}
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Use this in your URL: https://myappurl.com/&AES={encrypted}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://myappurl.com/&AES=${encrypted}`);
                alert('URL copied to clipboard!');
              }}
              className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-medium py-1 px-3 rounded-md text-xs"
            >
              Copy URL to Clipboard
            </button>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a demo page to generate encrypted URLs for testing.</p>
          <p className="mt-2">The actual login page is at <code>/login</code></p>
        </div>
      </motion.div>
    </div>
  );
}