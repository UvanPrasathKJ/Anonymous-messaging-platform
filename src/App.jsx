import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

// Lazy-load the heavy React Flow page so it doesn't bloat the initial bundle
const NetworkMonitor = lazy(() => import('./pages/NetworkMonitor'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/network" element={
          <Suspense fallback={
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              height:'100vh', background:'#060810',
              fontFamily:'JetBrains Mono, monospace', color:'rgba(34,211,238,0.7)',
              fontSize:13, letterSpacing:'0.1em'
            }}>
              // Loading Network Monitor...
            </div>
          }>
            <NetworkMonitor />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
