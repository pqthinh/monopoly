import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ setToken }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/register', formData);
            setToken(res.data.token);
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <form className="auth-form" onSubmit={onSubmit}>
            <input type="text" name="username" value={username} onChange={onChange} required />
            <input type="password" name="password" value={password} onChange={onChange} required />
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;