import React from 'react'; 
import { Link } from 'react-router-dom';
import './Style.css';

function Home() {
  return (
    <div className="container">
      <h1>Welcome to the App</h1>
     <button><Link to="/login">Login to App</Link></button> 
    </div>
  );
}

export default Home;
