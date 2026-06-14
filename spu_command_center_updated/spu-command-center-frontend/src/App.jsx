import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CallsignManagement from './pages/CallsignManagement';
import EventManagement from './pages/EventManagement';
import IncidentManagement from './pages/IncidentManagement';
import TranscriptViewer from './pages/TranscriptViewer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transcripts" element={<TranscriptViewer />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/callsigns" element={<CallsignManagement />} />
            <Route path="/admin/events" element={<EventManagement />} />
            <Route path="/admin/incidents" element={<IncidentManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
