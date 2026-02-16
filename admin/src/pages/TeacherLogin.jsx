import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Configure a built-in teacher credential (can be overridden via .env)
const TEACHER_EMAIL = import.meta.env.VITE_TEACHER_EMAIL || 'teacher@example.com';
const TEACHER_PASSWORD = import.meta.env.VITE_TEACHER_PASSWORD || 'TeachPass123';

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    // Local hard-coded teacher credential shortcut
    if (email === TEACHER_EMAIL && password === TEACHER_PASSWORD) {
      // store teacher email (and optionally a flag) then redirect
      localStorage.setItem('teacherEmail', email);
      // optional token flag for compatibility
      localStorage.setItem('teacherToken', 'local-auth');
      navigate('/teacher-dashboard');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.role !== 'teacher') {
        setError('Access denied. Only teachers allowed.');
        return;
      }

      localStorage.setItem('teacherToken', data.token);
      localStorage.setItem('teacherEmail', data.email);

      navigate('/teacher-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl mb-4 text-center font-bold text-indigo-300">Teacher Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full p-2 rounded bg-gray-700 text-white pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 text-gray-400 hover:text-white focus:outline-none"
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 ease-in-out cursor-pointer"
        >
          🎓 Student Login
        </button>
      </div>
    </div>
  );
};

export default TeacherLogin;
