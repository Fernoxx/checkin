import { useState, useEffect } from 'react'
import { Connect } from '@stacks/connect-react'
import { AppConfig, UserSession } from '@stacks/connect'
import CheckinDashboard from './components/CheckinDashboard'
import WalletConnect from './components/WalletConnect'
import './App.css'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

function App() {
  const [userData, setUserData] = useState(userSession.loadUserData())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
    }
  }, [])

  const handleSignOut = () => {
    userSession.signUserOut()
    setUserData(null)
  }

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: 'Stacks Xverse Checkin',
          icon: window.location.origin + '/vite.svg',
        },
        redirectTo: '/',
        onFinish: () => {
          setUserData(userSession.loadUserData())
          setIsLoading(false)
        },
        userSession,
      }}
    >
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
              <WalletConnect onConnect={() => setIsLoading(true)} />
            )}
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>Built for Stacks Builder Rewards by Talent App</p>
          </div>
        </footer>
      </div>
    </Connect>
  )
}

export default App

