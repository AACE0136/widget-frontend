import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { login } from './store/slices/authSlice';
import LoginPage from './pages/LoginPage';
import WidgetScannerPage from './pages/WidgetScannerPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isMsalAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const dispatch = useAppDispatch();

  // Check if user is authenticated via MSAL on app load/refresh
  useEffect(() => {
    if (isMsalAuthenticated && accounts.length > 0 && !isAuthenticated) {
      const account = accounts[0];
      dispatch(
        login({
          email: account.username,
          name: account.name,
          method: 'sso',
        })
      );
    }
  }, [isMsalAuthenticated, accounts, isAuthenticated, dispatch]);

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
