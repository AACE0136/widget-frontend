import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useGetUsersQuery, useCreateUserMutation } from '../store/slices/apiSlice';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  // RTK Query example
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: 'New User',
        email: 'newuser@example.com',
      }).unwrap();
      alert('User created successfully!');
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Home</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">RTK Query Example</h2>
          
          <button
            onClick={handleCreateUser}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mb-4"
          >
            Create Sample User (Mutation Example)
          </button>

          {isLoading && <p className="text-gray-600">Loading users...</p>}
          {error && <p className="text-red-600">Error loading users</p>}
          
          {users && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-gray-700">Users List (Query Example):</h3>
              <div className="grid gap-2">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="border border-gray-200 p-3 rounded">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
