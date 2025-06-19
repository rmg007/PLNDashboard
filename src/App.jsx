import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import UniquePermits from './pages/UniquePermits.jsx';
import DeptActivity from './pages/DeptActivity.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Unique Permits Routes */}
          <Route path="uniquepermits" element={<UniquePermits />}>
            <Route index element={<UniquePermits />} />
            <Route path=":reportType" element={<UniquePermits />} />
          </Route>
          
          {/* Department Activity Routes */}
          <Route path="deptactivity" element={<DeptActivity />}>
            <Route index element={<DeptActivity />} />
            <Route path=":deptType" element={<DeptActivity />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
