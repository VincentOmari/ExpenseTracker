import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Set axios default for credentials outside of the component or in a config file
axios.defaults.withCredentials = true;

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/dashboard')
      .then(res => {
        console.log(res);
        if (res.data.valid) {
          setMessage(res.data.message);
        } else {
          navigate('/');
        }
      })
      .catch(err => console.error(err));
  }, [navigate]); // Dependency array includes navigate to avoid warnings

  return (
    <h2>Dashboard {message}</h2>
  );
};

export default Dashboard;
