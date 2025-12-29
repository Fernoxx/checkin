'use client';

import { useState } from 'react';
import { useConnect } from '@stacks/connect';
import styles from './WalletSelector.module.css';

interface WalletSelectorProps {
  onConnect: () => void;
}

export default function WalletSelector({ onConnect }: WalletSelectorProps) {
  const { doOpenAuth } = useConnect();
  // const { open } = useAppKit(); // Will be enabled when Reown AppKit is fully configured
  const [selectedMethod, setSelectedMethod] = useState<'stacks' | 'reown' | null>(null);

  const handleStacksConnect = () => {
    setSelectedMethod('stacks');
    onConnect();
    doOpenAuth();
  };

  const handleReownConnect = () => {
    setSelectedMethod('reown');
    onConnect();
    // open(); // Will be enabled when Reown AppKit is fully configured
    alert('WalletConnect integration coming soon! For now, please use Stacks Connect (Xverse/Leather).');
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
              disabled={selectedMethod === 'stacks'}
            >
              Connect via WalletConnect
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

