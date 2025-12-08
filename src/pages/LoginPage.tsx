import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { loginRequest } from '../config/authConfig';
import { authService } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { instance } = useMsal();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'abc@gmail.com' && password === 'Test@123') {
      dispatch(login({ email, method: 'basic' }));
      navigate('/widget-scanner');
    } else {
      setError('Invalid credentials. Please use abc@gmail.com / Test@123');
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        
        {/* Microsoft SSO Button */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          className="w-full mb-4 px-4 py-3 bg-[#2F2F2F] text-white rounded-md hover:bg-[#1F1F1F] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="abc@gmail.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Test@123"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Demo credentials:</p>
          <p className="font-mono">abc@gmail.com / Test@123</p>
        </div>
      </div>
    </div>
  );
}
