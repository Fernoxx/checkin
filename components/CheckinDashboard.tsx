'use client';

import { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { standardPrincipalCV, uintCV } from '@stacks/transactions';
import { format } from 'date-fns';
import styles from './CheckinDashboard.module.css';
import type { UserData, FeeSummary, UserStats } from '@/types';

interface CheckinDashboardProps {
  userData: UserData;
  userSession: any;
  onSignOut: () => void;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.split('.')[0] || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.split('.')[1] || 'checkin';
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
const NETWORK = NETWORK_NAME === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

export default function CheckinDashboard({ userData, userSession, onSignOut }: CheckinDashboardProps) {
  const { doContractCall } = useConnect();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hasClaimedInitial, setHasClaimedInitial] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userAddress = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;

  useEffect(() => {
    loadCheckinData();
  }, [userAddress]);

  const loadCheckinData = async () => {
    setIsLoading(true);
    try {
      // Check if user has checked in today
      const hasCheckedInResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'has-checked-in-today',
        functionArgs: [standardPrincipalCV(userAddress)],
        senderAddress: userAddress,
      });

      setHasCheckedInToday(hasCheckedInResult.value === true);

      // Check if user has claimed initial reward
      const hasClaimedResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'has-claimed-initial-reward',
        functionArgs: [standardPrincipalCV(userAddress)],
        senderAddress: userAddress,
      });

      setHasClaimedInitial(hasClaimedResult.value === true);

      // Get user stats
      const statsResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-stats',
        functionArgs: [standardPrincipalCV(userAddress)],
        senderAddress: userAddress,
      });

      if (statsResult.value) {
        setUserStats(statsResult.value as UserStats);
      }

      // Get fee summary
      const feeResult = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-fee-summary',
        functionArgs: [],
        senderAddress: userAddress,
      });

      if (feeResult.value) {
        setFeeSummary(feeResult.value as FeeSummary);
      }
    } catch (error) {
      console.error('Error loading checkin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckin = async () => {
    setIsCheckingIn(true);
    try {
      await doContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'daily-check-in',
        functionArgs: [],
        onFinish: (data: any) => {
          console.log('Checkin successful:', data);
          setHasCheckedInToday(true);
          loadCheckinData();
          setIsCheckingIn(false);
        },
        onCancel: () => {
          setIsCheckingIn(false);
        },
      });
    } catch (error) {
      console.error('Error checking in:', error);
      setIsCheckingIn(false);
    }
  };

  const formatSTX = (microstx: string) => {
    return (Number(microstx) / 1000000).toFixed(2);
  };

  const getTierInfo = () => {
    if (hasClaimedInitial) {
      return {
        tier: 2,
        name: 'Daily Checkin',
        fee: feeSummary ? formatSTX(feeSummary['fee-daily'].value) : '0.20',
        reward: feeSummary ? formatSTX(feeSummary['reward-daily'].value) : '0.25',
        color: 'var(--tier2)',
      };
    }
    return {
      tier: 1,
      name: 'Welcome Bonus',
      fee: feeSummary ? formatSTX(feeSummary['fee-initial'].value) : '1.00',
      reward: feeSummary ? formatSTX(feeSummary['reward-initial'].value) : '1.50',
      color: 'var(--tier1)',
    };
  };

  const tierInfo = getTierInfo();

  return (
    <div className={styles.checkinDashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {userAddress.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2>Welcome back!</h2>
            <p className={styles.userAddress}>
              {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
            </p>
          </div>
        </div>
        <button className={styles.signOutButton} onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.checkinCard}>
            <div className={styles.checkinHeader}>
              <h3>Daily Checkin</h3>
              <span className={styles.dateBadge}>
                {format(new Date(), 'MMM dd, yyyy')}
              </span>
            </div>

            {hasCheckedInToday ? (
              <div className={styles.checkinSuccess}>
                <div className={styles.successIcon}>✅</div>
                <h4>You&apos;ve checked in today!</h4>
                <p>Come back tomorrow for your next checkin</p>
              </div>
            ) : (
              <div className={styles.checkinAction}>
                <div className={styles.tierBadge} style={{ backgroundColor: tierInfo.color }}>
                  <span className={styles.tierLabel}>Tier {tierInfo.tier}</span>
                  <span className={styles.tierName}>{tierInfo.name}</span>
                </div>
                <div className={styles.feeRewardInfo}>
                  <div className={styles.feeBox}>
                    <span className={styles.label}>Fee</span>
                    <span className={styles.amount}>{tierInfo.fee} STX</span>
                  </div>
                  <div className={styles.arrow}>→</div>
                  <div className={styles.rewardBox}>
                    <span className={styles.label}>Reward</span>
                    <span className={styles.amount}>{tierInfo.reward} STX</span>
                  </div>
                </div>
                <p className={styles.checkinDescription}>
                  {tierInfo.tier === 1
                    ? 'First time checkin! Pay 1 STX to receive 1.5 STX reward.'
                    : 'Daily checkin! Pay 0.2 STX to receive 0.25 STX reward.'}
                </p>
                <button
                  className={styles.checkinButton}
                  onClick={handleCheckin}
                  disabled={isCheckingIn || !feeSummary?.['contract-active'].value}
                >
                  {isCheckingIn
                    ? 'Processing...'
                    : feeSummary?.['contract-active'].value === false
                    ? 'Contract Inactive'
                    : `Check In Now (${tierInfo.fee} STX)`}
                </button>
              </div>
            )}
          </div>

          {userStats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statValue}>
                  {Number(userStats['total-checkins'].value)}
                </div>
                <div className={styles.statLabel}>Total Checkins</div>
              </div>
              {feeSummary && (
                <>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statValue}>
                      {formatSTX(feeSummary['current-reward-pool'].value)}
                    </div>
                    <div className={styles.statLabel}>Reward Pool</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>📈</div>
                    <div className={styles.statValue}>
                      {formatSTX(feeSummary['total-rewards-distributed'].value)}
                    </div>
                    <div className={styles.statLabel}>Total Distributed</div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className={styles.infoSection}>
            <h4>About Stacks Builder Rewards</h4>
            <p>
              This checkin app is part of the Stacks Builder Rewards program by Talent App.
              Builders are rewarded based on their contributions to the Stacks ecosystem,
              including on-chain activity, smart contract usage, and GitHub contributions.
            </p>
            {feeSummary && (
              <div className={styles.feeSummary}>
                <h5>Contract Status</h5>
                <div className={styles.summaryGrid}>
                  <div>
                    <span>Total Fees Collected:</span>
                    <strong>{formatSTX(feeSummary['total-fees-collected'].value)} STX</strong>
                  </div>
                  <div>
                    <span>Reward Pool:</span>
                    <strong>{formatSTX(feeSummary['current-reward-pool'].value)} STX</strong>
                  </div>
                  <div>
                    <span>Status:</span>
                    <strong
                      style={{
                        color:
                          feeSummary['contract-active'].value === true
                            ? 'var(--success)'
                            : 'var(--error)',
                      }}
                    >
                      {feeSummary['contract-active'].value === true ? 'Active' : 'Inactive'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

