import { useState, useEffect } from 'react'
import { useConnect } from '@stacks/connect-react'
import { callReadOnlyFunction, callReadOnlyFunctionResponse } from '@stacks/transactions'
import { StacksTestnet, StacksMainnet } from '@stacks/network'
import { standardPrincipalCV, uintCV } from '@stacks/transactions'
import { format } from 'date-fns'
import './CheckinDashboard.css'

interface UserData {
  profile: {
    stxAddress: {
      mainnet: string
      testnet: string
    }
  }
}

interface CheckinDashboardProps {
  userData: UserData
  userSession: any
  onSignOut: () => void
}

// Update with your deployed contract address
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
const CONTRACT_NAME = 'checkin'
const NETWORK = new StacksTestnet() // Change to StacksMainnet for production

function CheckinDashboard({ userData, userSession, onSignOut }: CheckinDashboardProps) {
  const { doContractCall } = useConnect()
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [userStats, setUserStats] = useState<{
    streak: number
    total: number
    lastCheckinDay: number
  } | null>(null)
  const [totalCheckins, setTotalCheckins] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const userAddress = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet

  useEffect(() => {
    loadCheckinData()
  }, [userAddress])

  const loadCheckinData = async () => {
    setIsLoading(true)
    try {
      // Get current block height from network
      const networkUrl = NETWORK.getCoreApiUrl()
      const chainInfoResponse = await fetch(`${networkUrl}/v2/info`)
      const chainInfo = await chainInfoResponse.json()
      const currentBlockHeight = chainInfo.stacks_tip_height || 0

      // Check if user has checked in today
      const hasCheckedInResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'has-checked-in-today',
        functionArgs: [standardPrincipalCV(userAddress), uintCV(currentBlockHeight)],
        senderAddress: userAddress,
      })

      setHasCheckedInToday(hasCheckedInResult.value === true)

      // Get user stats
      const statsResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-stats',
        functionArgs: [standardPrincipalCV(userAddress)],
        senderAddress: userAddress,
      })

      if (statsResult.value) {
        const stats = statsResult.value as any
        setUserStats({
          streak: Number(stats.streak.value),
          total: Number(stats.total.value),
          lastCheckinDay: Number(stats['last-checkin-day'].value || 0),
        })
      }

      // Get total checkins
      const totalResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-total-checkins',
        functionArgs: [],
        senderAddress: userAddress,
      })

      if (totalResult.value) {
        setTotalCheckins(Number(totalResult.value))
      }
    } catch (error) {
      console.error('Error loading checkin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckin = async () => {
    setIsCheckingIn(true)
    try {
      await doContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'checkin',
        functionArgs: [],
        onFinish: (data: any) => {
          console.log('Checkin successful:', data)
          setHasCheckedInToday(true)
          loadCheckinData()
          setIsCheckingIn(false)
        },
        onCancel: () => {
          setIsCheckingIn(false)
        },
      })
    } catch (error) {
      console.error('Error checking in:', error)
      setIsCheckingIn(false)
    }
  }

  return (
    <div className="checkin-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {userAddress.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2>Welcome back!</h2>
            <p className="user-address">{userAddress.slice(0, 10)}...{userAddress.slice(-8)}</p>
          </div>
        </div>
        <button className="sign-out-button" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="checkin-card">
            <div className="checkin-header">
              <h3>Daily Checkin</h3>
              <span className="date-badge">{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
            
            {hasCheckedInToday ? (
              <div className="checkin-success">
                <div className="success-icon">✅</div>
                <h4>You've checked in today!</h4>
                <p>Come back tomorrow for your next checkin</p>
              </div>
            ) : (
              <div className="checkin-action">
                <p>Ready to check in and continue your streak?</p>
                <button
                  className="checkin-button"
                  onClick={handleCheckin}
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? 'Processing...' : 'Check In Now'}
                </button>
              </div>
            )}
          </div>

          {userStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{userStats.streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{userStats.total}</div>
                <div className="stat-label">Total Checkins</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{totalCheckins}</div>
                <div className="stat-label">Community Total</div>
              </div>
            </div>
          )}

          <div className="info-section">
            <h4>About Stacks Builder Rewards</h4>
            <p>
              This checkin app is part of the Stacks Builder Rewards program by Talent App.
              Builders are rewarded based on their contributions to the Stacks ecosystem,
              including on-chain activity, smart contract usage, and GitHub contributions.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default CheckinDashboard

