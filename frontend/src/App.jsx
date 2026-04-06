import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    axios.get('http://localhost:3001/api/health')
      .then(res => {
        if(res.data.status === 'ok' && res.data.db === 'ok') {
          setStatus('Backend OK');
        } else {
          setStatus('Backend error: ' + res.data.message);
        }
      })
      .catch(err => setStatus('Backend not reachable'));
  }, []);

  return (
    <div style={{ padding: 50 }}>
      <h1>{status}</h1>
    </div>
  );
}

export default App;