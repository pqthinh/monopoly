import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, UserPlus, LogIn, Crown, Shield } from 'lucide-react';
import gameLogger from '../services/GameLogger';
import '../styles/AuthScreen.css';

const AuthScreen = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { username, password, confirmPassword } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validateForm = () => {
        if (!username || !password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return false;
        }
        if (username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            return false;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        return true;
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        gameLogger.userAction(isLogin ? 'Login attempt' : 'Registration attempt', { username });
        
        try {
            // For development/demo purposes - create mock authentication when backend is not available
            // if (window.location.hostname === 'localhost') {
            //     // Mock successful authentication for development
            //     const mockUser = { id: 1, username: username };
            //     const mockToken = 'mock-jwt-token-' + Date.now();
            //     localStorage.setItem('token', mockToken);
            //     localStorage.setItem('user', JSON.stringify(mockUser));
            //     gameLogger.info(isLogin ? 'Mock login successful' : 'Mock registration successful', { username });
            //     onLogin(mockUser, mockToken);
            //     return;
            // }

            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await axios.post(`https://monopoly.lexispeak.com${endpoint}`, {
                username,
                password
            });
            
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            gameLogger.info(isLogin ? 'Login successful' : 'Registration successful', { userId: user.id, username: user.username });
            onLogin(user, token);
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.msg || 'Có lỗi xảy ra, vui lòng thử lại';
            const translatedMessage = message === 'User already exists' ? 'Tên đăng nhập đã tồn tại' : 
                     message === 'Invalid Credentials' ? 'Tên đăng nhập hoặc mật khẩu không đúng' : message;
            setError(translatedMessage);
            gameLogger.error(isLogin ? 'Login failed' : 'Registration failed', { username, error: message });
        }
        setLoading(false);
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setFormData({ username: '', password: '', confirmPassword: '' });
        setError('');
    };

    return (
        <div className="auth-container">
            <div className="auth-background"></div>
            <div className="auth-content">
                <div className="auth-header">
                    <div className="auth-logo">
                        <h1 className="auth-title">Kỳ Sử Lạc Hồng</h1>
                        <p className="auth-subtitle">Boardgame lịch sử Việt Nam</p>
                    </div>
                </div>

                <div className="auth-card">
                    <div className="auth-tabs">
                        <button 
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            <LogIn size={20} />
                            Đăng nhập
                        </button>
                        <button 
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            <UserPlus size={20} />
                            Đăng ký
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={onSubmit}>
                        <div className="form-section">
                            <h3 className="form-title">
                                {isLogin ? (
                                    <>
                                        <Shield size={24} />
                                        Đăng nhập tài khoản
                                    </>
                                ) : (
                                    <>
                                        <Crown size={24} />
                                        Tạo tài khoản mới
                                    </>
                                )}
                            </h3>

                            {error && (
                                <div className="error-message">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="input-group">
                                <div className="input-icon">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={onChange}
                                    placeholder="Tên đăng nhập"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <div className="input-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="Mật khẩu"
                                    className="input-field"
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div className="input-group">
                                    <div className="input-icon">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        placeholder="Xác nhận mật khẩu"
                                        className="input-field"
                                        required
                                    />
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="auth-submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading-spinner">⏳</span>
                                ) : isLogin ? (
                                    <>
                                        <LogIn size={20} />
                                        Đăng nhập
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={20} />
                                        Đăng ký
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="auth-switch">
                        <p>
                            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                            <button 
                                type="button" 
                                className="switch-button"
                                onClick={switchMode}
                            >
                                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="auth-footer">
                    <p>🏮 Trải nghiệm lịch sử Việt Nam qua boardgame 🏮</p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;