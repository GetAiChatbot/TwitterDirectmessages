import React from 'react';
import './Style.css';


function Login() {
  return (
    <div className="container">
      <h1>Login with Twitter</h1>
      <button><a href="http://localhost:3000/auth/twitter">Login with Twitter</a></button>
      
    </div>
  );
}

export default Login;
