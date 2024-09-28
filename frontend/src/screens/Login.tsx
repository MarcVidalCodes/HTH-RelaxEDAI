import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaUser, FaLock } from "react-icons/fa";
import logo from '../assets/logo.png';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); 
    const { login } = useContext(AuthContext); 

    const handleRegisterClick = () => {
        setIsRegister(true);
        setError('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleLoginClick = () => {
        setIsRegister(false);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
  
        // Registration logic
        if (isRegister) {
          if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
          }
          try {
            await axios.post('http://localhost:5001/api/register', {
              email: username,
              password,
            });
            setMessage('Registration successful');
            setError('');
            setTimeout(() => {
              navigate('/home'); // Redirect to the dashboard after 3 seconds
            }, 3000);
          } catch (error) {
            setError('Registration failed');
          }
        } 
        // Login logic
        else {
          try {
            const response = await axios.post('http://localhost:5001/api/login', {
              email: username,
              password,
            });
            const { accessToken } = response.data; // Get token from response
  
            // Use AuthContext's login function to store the token
            login(accessToken); 
            setMessage('Login successful');
            setError('');
            setTimeout(() => {
              navigate('/home'); // Redirect to the home after login
            }, 3000);
          } catch (error) {
            setError('Login failed');
          }
        }
    };

    return (
      <div className="login-container">
        <div className="left-box">
          <div className='wrapper'>
          <form onSubmit={handleSubmit}>
              <img src={logo} alt="Company Logo" className="logo" />
              <h1>{isRegister ? 'Register' : 'Login'}</h1>
              <div className="input-box">
                <input 
                  type="text" 
                  placeholder='Username' 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
                <FaUser className='icon' />
              </div>
              <div className="input-box">
                <input 
                  type="password" 
                  placeholder='Password' 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <FaLock className='icon'/>
              </div>

              {isRegister && (
                <div className="input-box">
                  <input 
                    type="password" 
                    placeholder='Confirm Password' 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                  <FaLock className='icon'/>
                </div>
              )}

              <div className="remember-forget">
                {!isRegister && (
                  <>
                    <label><input type="checkbox" />Remember me</label>
                    <a href="#">Forgot password?</a>
                  </>
                )}
              </div>

              <button type="submit">{isRegister ? 'Register' : 'Login'}</button>

              {error && <div className="alert error">{error}</div>}
              {message && <div className="alert success">{message}</div>}

              <div className="register-link">
                <p>{isRegister ? 'Already have an account?' : "Don't have an account?"} <a href="#" onClick={isRegister ? handleLoginClick : handleRegisterClick}>{isRegister ? 'Login' : 'Register'}</a></p>
              </div>

            </form>
          </div>
        </div>
        <div className="right-box"></div>
      </div>
    );
};

export default Login;