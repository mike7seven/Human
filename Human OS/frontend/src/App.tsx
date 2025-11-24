import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CognitiveStateProvider } from '@/context/CognitiveStateContext';
import { Layout } from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import Focus from '@/pages/Focus';
import Loops from '@/pages/Loops';
import Threads from '@/pages/Threads';
import Ingest from '@/pages/Ingest';
import Emotion from '@/pages/Emotion';
import Archive from '@/pages/Archive';
import Settings from '@/pages/Settings';

function App() {
  return (
    <CognitiveStateProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/loops" element={<Loops />} />
            <Route path="/threads" element={<Threads />} />
            <Route path="/ingest" element={<Ingest />} />
            <Route path="/emotion" element={<Emotion />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CognitiveStateProvider>
  );
}

export default App;
