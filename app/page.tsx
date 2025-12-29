'use client';

import { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { Providers } from './providers';

// Disable static generation - this page needs to be dynamic
export const dynamic = 'force-dynamic';

// Dynamically import components that use Stacks Connect (client-only)
const CheckinDashboard = dynamicImport(() => import('@/components/CheckinDashboard'), { ssr: false });
const WalletSelector = dynamicImport(() => import('@/components/WalletSelector'), { ssr: false });

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      import('@stacks/connect').then(({ AppConfig, UserSession }) => {
        try {
          const appConfig = new AppConfig(['store_write', 'publish_data']);
          const session = new UserSession({ appConfig });
          setUserSession(session);
          
          if (session.isUserSignedIn()) {
            setUserData(session.loadUserData());
          }
        } catch (error) {
          console.error('Error initializing Stacks Connect:', error);
        }
      }).catch((error) => {
        console.error('Error loading Stacks Connect:', error);
      });
    }
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
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading...</p>
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

