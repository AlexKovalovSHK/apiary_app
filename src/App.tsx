import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { HiveList } from './components/hives/HiveList';
import { HiveForm } from './components/hives/HiveForm';
import { HiveDetails } from './components/hives/HiveDetails';
import { HiveEdit } from './components/hives/HiveEdit';
import { Settings } from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="hives" element={<HiveList />} />
          <Route path="hives/new" element={<HiveForm />} />
          <Route path="hives/edit/:id" element={<HiveEdit />} />
          <Route path="hives/:id" element={<HiveDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
