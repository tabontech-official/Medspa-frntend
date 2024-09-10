import React, { useState } from 'react';
import { useAuthContext } from '../Hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa'; // Import a spinner icon

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New state for loading
  const { dispatch } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null); 

    try {
      const response = await fetch('https://medspaa.vercel.app/auth/signIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'LOGIN', payload: json });
        localStorage.setItem('usertoken', json.token); 
        localStorage.setItem('userid', json.data.shopifyId );
        navigate('/dashboard');
      } else {
    
        setError(json.message || 'Login failed. Please try again.');
      }
    } catch (error) {
   
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-blue-500 dark:border-blue-500">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center mb-4">
          <span className="absolute">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>

          <input
            type="email"
            className="block w-full py-3 text-gray-700 bg-white border border-blue-500 rounded-lg px-11 dark:bg-gray-900 dark:text-gray-300 dark:border-blue-500 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative flex items-center mb-4">
          <span className="absolute">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-3 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>

          <input
            type="password"
            className="block w-full px-10 py-3 text-gray-700 bg-white border border-blue-500 rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-blue-500 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
            placeholder="Password"
            min={8}
            max={16}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400'} rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 mt-6`}
          disabled={loading} // Disable button when loading
        >
          {loading ? <FaSpinner className="animate-spin w-5 h-5 mx-auto" /> : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
