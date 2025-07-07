import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

function AuthScreen({ setToken }) {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div>
            {showLogin ? (
                <>
                    <Login setToken={setToken} />
                    <p>Chưa có tài khoản? <button onClick={() => setShowLogin(false)}>Đăng ký</button></p>
                </>
            ) : (
                <>
                    <Register setToken={setToken} />
                    <p>Đã có tài khoản? <button onClick={() => setShowLogin(true)}>Đăng nhập</button></p>
                </>
            )}
        </div>
    );
}

export default AuthScreen;