import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { loginRequest } from '../config/authConfig';
import { authService } from '../services/authService';
import LoginHeader from '../components/LoginHeader';

export default function LoginPage() {

  const [, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { instance } = useMsal();

  // Clear logout flag when user lands on login page
  useEffect(() => {
    authService.clearLogoutFlag();
  }, []);


  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await instance.loginPopup(loginRequest);
      console.log("MSAL RESPONSE:",response.idToken);
      
      if (response.account && response.idToken) {
        // Call backend API to get backend token
        try {
          await authService.getBackendToken(response.idToken);
          
          dispatch(
            login({
              email: response.account.username,
              name: response.account.name,
              method: 'sso',
            })
          );
          navigate('/widget-scanner');
        } catch (backendError) {
          console.error('Backend token exchange failed:', backendError);
          setError('Failed to authenticate with backend server. Please try again.');
          // Logout from MSAL if backend authentication fails
          await instance.logoutPopup();
        }
      }
    } catch (error: any) {
      console.error('Microsoft login failed:', error);
      setError('Microsoft login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LoginHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md px-4">
        <div className="text-lg font-normal text-black italic mb-6  text-center">Log in your account</div>
        
        {/* Microsoft SSO Button */}
        <div className='flex items-center justify-center'>
        <button
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          className="flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-[#5e5e5e] border border-[#8c8c8c] rounded text-base font-medium cursor-pointer w-full opacity-100 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-w-[320px]"
        >
          {isLoading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
              </svg>
              <span>Sign in with Microsoft</span>
            </>
          )}
        </button>
        </div>

        

       
        </div>
      </div>
    </div>
  );
}
