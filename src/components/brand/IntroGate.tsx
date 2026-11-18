import { useCallback, useState, type ReactNode } from 'react';
import IntroLoader from '@/components/brand/IntroLoader';

const INTRO_SEEN_KEY = 'aikya:intro-seen';

export default function IntroGate({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(() => !window.sessionStorage.getItem(INTRO_SEEN_KEY));

  const finishIntro = useCallback(() => {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    setShowIntro(false);
  }, []);

  return (
    <>
      {children}
      {showIntro && <IntroLoader onDone={finishIntro} />}
    </>
  );
}
