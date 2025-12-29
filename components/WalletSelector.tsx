'use client';

import { useState, useEffect } from 'react';
import { authenticate } from '@stacks/connect';
import styles from './WalletSelector.module.css';

interface WalletSelectorProps {
  onConnect: () => void;
}

export default function WalletSelector({ onConnect }: WalletSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stacks' | 'reown' | null>(null);
  const [hasProjectId, setHasProjectId] = useState(false);
  const [appKitError, setAppKitError] = useState(false);

  useEffect(() => {
    // Check if WalletConnect Project ID is configured
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    setHasProjectId(!!projectId && projectId.length > 0);
  }, []);

  const handleReownConnect = async () => {
    if (!hasProjectId) {
      alert('WalletConnect Project ID is required. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your environment variables.');
      return;
    }
    try {
      const { useAppKit } = await import('@reown/appkit/react');
      const { open } = useAppKit();
      setSelectedMethod('reown');
      onConnect();
      open();
    } catch (error) {
      console.error('Error loading Reown AppKit:', error);
      setAppKitError(true);
      alert('WalletConnect is not available. Please use Stacks Wallets instead.');
    }
  };

  const handleStacksConnect = () => {
    setSelectedMethod('stacks');
    onConnect();
    authenticate({
      appDetails: {
        name: 'Stacks Xverse Checkin',
        icon: typeof window !== 'undefined' ? window.location.origin + '/icon.png' : '',
      },
      redirectTo: '/',
      onFinish: () => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },
    });
  };

  const handleReownConnect = () => {
    if (!hasProjectId) {
      alert('WalletConnect Project ID is required. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your environment variables.');
      return;
    }
    setSelectedMethod('reown');
    onConnect();
    open();
  };

  return (
    <div className={styles.walletSelector}>
      <div className={styles.walletSelectorCard}>
        <div className={styles.walletIcon}>🔐</div>
        <h2>Connect Your Wallet</h2>
        <p className={styles.description}>
          Choose your preferred wallet to start checking in daily and earn rewards
          for your contributions to the Stacks ecosystem.
        </p>

        <div className={styles.walletOptions}>
          <div className={styles.walletOption}>
            <div className={styles.walletLogo}>🟠</div>
            <div className={styles.walletInfo}>
              <h3>Stacks Wallets</h3>
              <p>Xverse, Leather, and other Stacks wallets</p>
            </div>
            <button
              className={styles.connectButton}
              onClick={handleStacksConnect}
              disabled={selectedMethod === 'reown'}
            >
              Connect via Stacks
            </button>
          </div>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.walletOption}>
            <div className={styles.walletLogo}>🔷</div>
            <div className={styles.walletInfo}>
              <h3>WalletConnect</h3>
              <p>Connect via Reown AppKit (600+ wallets)</p>
            </div>
            <button
              className={styles.connectButton}
              onClick={handleReownConnect}
              disabled={selectedMethod === 'stacks' || !hasProjectId}
              title={!hasProjectId ? 'WalletConnect Project ID required' : ''}
            >
              {!hasProjectId ? 'Project ID Required' : 'Connect via WalletConnect'}
            </button>
          </div>
        </div>

        <p className={styles.infoText}>
          Your wallet connection is secure. No private keys are shared.
        </p>
      </div>
    </div>
  );
}

