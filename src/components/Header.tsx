import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-[#F6F6F6] shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Affine" className="h-8" />
            <div className="w-[2px] h-6 bg-gray-300"></div>
            <h1 className="font-black text-[32px] leading-5 text-gray-900 italic ">
              Widget Scanner
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            JD
          </button>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto px-6 pb-4 flex flex-row-reverse">
        <button 
          onClick={handleLogout}
          className="px-2 py-1 bg-white border border-gray-300 rounded-lg font-semibold text-base text-gray-800 hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
          
      </div>
    </header>
  );
}
