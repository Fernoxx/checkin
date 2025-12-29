import { useConnect } from '@stacks/connect-react'
import './WalletConnect.css'

interface WalletConnectProps {
  onConnect: () => void
}

function WalletConnect({ onConnect }: WalletConnectProps) {
  const { doOpenAuth } = useConnect()

  const handleConnect = () => {
    onConnect()
    doOpenAuth()
  }

  return (
    <div className="wallet-connect">
      <div className="wallet-connect-card">
        <div className="wallet-icon">🔐</div>
        <h2>Connect Your Xverse Wallet</h2>
        <p className="description">
          Connect your Xverse wallet to start checking in daily and earn rewards
          for your contributions to the Stacks ecosystem.
        </p>
        <button className="connect-button" onClick={handleConnect}>
          Connect Wallet
        </button>
        <p className="info-text">
          This app uses Stacks Connect to securely connect with your Xverse wallet.
          No private keys are shared.
        </p>
      </div>
    </div>
  )
}

export default WalletConnect



