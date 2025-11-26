import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import LoginPage from './pages/LoginPage';
import WidgetScannerPage from './pages/WidgetScannerPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

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
