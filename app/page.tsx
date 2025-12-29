'use client';

import { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { Providers } from './providers';

// Disable static generation - this page needs to be dynamic
export const dynamic = 'force-dynamic';

// Dynamically import components that use Stacks Connect (client-only)
const CheckinDashboard = dynamicImport(() => import('@/components/CheckinDashboard'), { 
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard...</div>
});
const WalletSelector = dynamicImport(() => import('@/components/WalletSelector'), { 
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Loading wallet selector...</div>
});

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    
    // Use a small delay to ensure window is fully ready
    const initTimer = setTimeout(() => {
      Promise.resolve().then(async () => {
        try {
          const { AppConfig, UserSession } = await import('@stacks/connect');
          
          if (!mounted) return;
          
          const appConfig = new AppConfig(['store_write', 'publish_data']);
          const session = new UserSession({ appConfig });
          setUserSession(session);
          
          if (session.isUserSignedIn()) {
            setUserData(session.loadUserData());
          }
        } catch (error) {
          if (!mounted) return;
          console.error('Error initializing Stacks Connect:', error);
          setInitError(error instanceof Error ? error.message : 'Failed to initialize Stacks Connect');
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      });
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimer);
    };
  }, []);

  const handleSignOut = () => {
    if (userSession) {
      userSession.signUserOut();
      setUserData(null);
    }
  };

  return (
    <div className="app">
        <header className="app-header">
          <div className="container">
            <h1>🎯 Stacks Xverse Checkin</h1>
            <p className="subtitle">Daily checkin rewards for Stacks builders</p>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            {initError ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                <h3>Initialization Error</h3>
                <p>{initError}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                  Please refresh the page or check your browser console for more details.
                </p>
              </div>
            ) : isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Initializing...</p>
              </div>
            ) : userData && userSession ? (
              <CheckinDashboard
                userData={userData}
                userSession={userSession}
                onSignOut={handleSignOut}
              />
            ) : (
              <WalletSelector onConnect={() => setIsLoading(true)} />
            )}
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>Built for Stacks Builder Rewards by Talent App</p>
          </div>
        </footer>
      </div>
  );
}

