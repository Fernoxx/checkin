'use client';

import { useConnect } from '@stacks/connect-react';
import styles from './WalletConnect.module.css';

interface WalletConnectProps {
  onConnect: () => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { doOpenAuth } = useConnect();

  const handleConnect = () => {
    onConnect();
    doOpenAuth();
  };

  return (
    <div className={styles.walletConnect}>
      <div className={styles.walletConnectCard}>
        <div className={styles.walletIcon}>🔐</div>
        <h2>Connect Your Xverse Wallet</h2>
        <p className={styles.description}>
          Connect your Xverse wallet to start checking in daily and earn rewards
          for your contributions to the Stacks ecosystem.
        </p>
        <button className={styles.connectButton} onClick={handleConnect}>
          Connect Wallet
        </button>
        <p className={styles.infoText}>
          This app uses Stacks Connect to securely connect with your Xverse wallet.
          No private keys are shared.
        </p>
      </div>
    </div>
  );
}

