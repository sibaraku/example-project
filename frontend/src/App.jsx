import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PriceSync from './components/PriceSync';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    axios.get('http://localhost:3001/api/health')
      .then(res => {
        if (res.data.status === 'ok' && res.data.db === 'ok') {
          setStatus('Backend OK');
        } else {
          setStatus('Backend error: ' + res.data.message);
        }
      })
      .catch(err => setStatus('Backend not reachable'));
  }, []);

  return (
    <div className="app-container">
      <h1 className="app-status">{status}</h1>

      {status === 'Backend OK' ? (
        <div className="app-body">
          <Dashboard />
          <div className="price-sync-panel">
            <PriceSync />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;