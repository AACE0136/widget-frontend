import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { login } from './store/slices/authSlice';
import { authService } from './services/authService';
import { setMsalContext } from './services/apiClient';
import LoginPage from './pages/LoginPage';
import WidgetScannerPage from './pages/WidgetScannerPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isMsalAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();
  const dispatch = useAppDispatch();

  // Set MSAL context for API client token refresh
  useEffect(() => {
    if (accounts.length > 0) {
      setMsalContext(instance, accounts[0]);
    }
  }, [instance, accounts]);

  // Check if user is authenticated via MSAL on app load/refresh
  useEffect(() => {
    const restoreSession = async () => {
      // Don't restore session if user explicitly logged out
      if (authService.isLoggedOut()) {
        return;
      }

      if (isMsalAuthenticated && accounts.length > 0 && !isAuthenticated) {
        const account = accounts[0];
        console.log("ACCOUNT:",account);
        
        // Check if backend token exists and is valid
        if (authService.isTokenValid()) {
          dispatch(
            login({
              email: account.username,
              name: account.name,
              method: 'sso',
            })
          );
        } else {
          // Token expired or doesn't exist, try to get a new one
          try {
            const tokenResponse = await instance.acquireTokenSilent({
              scopes: ['User.Read', 'https://analysis.windows.net/powerbi/api/Tenant.Read.All'],
              account: account,
            });
            
            if (tokenResponse.idToken) {
              await authService.getBackendToken(tokenResponse.idToken);
              dispatch(
                login({
                  email: account.username,
                  name: account.name,
                  method: 'sso',
                })
              );
            }
          } catch (error) {
            console.error('Failed to restore session:', error);
            authService.clearTokens();
          }
        }
      }
    };

    restoreSession();
  }, [isMsalAuthenticated, accounts, isAuthenticated, dispatch, instance]);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/widget-scanner" replace /> : <LoginPage />} 
        />
        <Route
          path="/widget-scanner"
          element={
            <PrivateRoute>
              <WidgetScannerPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
