import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

function AuthScreen({ setToken }) {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="screen-container auth-container">
            {showLogin ? (
                <>
                    <h2>Đăng nhập</h2>
                    <Login setToken={setToken} />
                    <p className="auth-toggle">
                        Chưa có tài khoản? 
                        <button onClick={() => setShowLogin(false)}>Đăng ký</button>
                    </p>
                </>
            ) : (
                <>
                    <h2>Đăng ký</h2>
                    <Register setToken={setToken} />
                    <p className="auth-toggle">
                        Đã có tài khoản? 
                        <button onClick={() => setShowLogin(true)}>Đăng nhập</button>
                    </p>
                </>
            )}
        </div>
    );
}

export default AuthScreen;