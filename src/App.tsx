import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Heatmap from './pages/Heatmap';
import Medicine from './pages/Medicine';
import ActionCenter from './pages/ActionCenter';
import Simulator from './pages/Simulator';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/predict" element={<Prediction />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/actions" element={<ActionCenter />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
