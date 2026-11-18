import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AppProvider } from '@/store/AppProvider';
import { CommunityAuthProvider } from '@/store/CommunityAuthProvider';
import IntroGate from '@/components/brand/IntroGate';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <CommunityAuthProvider>
          <IntroGate>
            <App />
          </IntroGate>
        </CommunityAuthProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
