'use client';

import { useState, useEffect } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { Providers } from './providers';
import CheckinDashboard from '@/components/CheckinDashboard';
import WalletSelector from '@/components/WalletSelector';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const handleSignOut = () => {
    userSession.signUserOut();
    setUserData(null);
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
            {userData ? (
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

