'use client';

import { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { fetchCallReadOnlyFunction, ClarityType, PostConditionMode } from '@stacks/transactions';
import { networkFromName } from '@stacks/network';
import { standardPrincipalCV } from '@stacks/transactions';
import { format } from 'date-fns';
import styles from './CheckinDashboard.module.css';
import type { UserData, UserStats } from '@/types';

interface CheckinDashboardProps {
  userData: UserData;
  userSession: any;
  onSignOut: () => void;
}

const CONTRACT_ADDRESS = 'SP2MT5CDNVWS10W834069Q3GZWVDT9ATB91GTZPBV';
const CONTRACT_NAME = 'checkin-daily';
const NETWORK_NAME = (process.env.NEXT_PUBLIC_NETWORK || 'mainnet') as 'mainnet' | 'testnet' | 'devnet' | 'mocknet';
const NETWORK = networkFromName(NETWORK_NAME);

export default function CheckinDashboard({ userData, userSession, onSignOut }: CheckinDashboardProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userAddress = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;

  useEffect(() => {
    loadCheckinData();
  }, [userAddress]);

  const loadCheckinData = async () => {
    setIsLoading(true);
    try {
      // Get user checkin data
      const checkinDataResult = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-checkin-data',
        functionArgs: [standardPrincipalCV(userAddress)],
        senderAddress: userAddress,
      });

      if (checkinDataResult.type === ClarityType.ResponseOk && checkinDataResult.value.type === ClarityType.Tuple) {
        const tuple = checkinDataResult.value as any;
        const totalCheckins = tuple.data['total-checkins']?.value?.toString() || '0';
        const lastCheckin = tuple.data['last-checkin']?.value?.toString() || '0';

        setUserStats({
          'total-checkins': { value: totalCheckins },
          'last-checkin-day': { value: lastCheckin },
        });

        // Determine if checked in recently (roughly within the same block window or day)
        // For simplicity, if they have any checkins and the last one was within a reasonable block distance
        // In a real app, we'd compare stacks-block-height
        // For now, we'll mark it as false if lastCheckin is 0, or let the contract handle the error if they try again too soon
        setHasCheckedInToday(false);
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
      // The contract handles STX transfers internally:
      // - User pays 0.1 STX fee (CHECKIN_FEE)
      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'checkin',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: any) => {
          console.log('Checkin successful:', data);
          setHasCheckedInToday(true);
          setTimeout(() => {
            loadCheckinData();
          }, 3000);
          setIsCheckingIn(false);
        },
        onCancel: () => {
          setIsCheckingIn(false);
        },
      });
    } catch (error) {
      console.error('Error checking in:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to initiate transaction'}`);
      setIsCheckingIn(false);
    }
  };

  const formatSTX = (microstx: string) => {
    return (Number(microstx) / 1000000).toFixed(2);
  };

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
                <h4>You&apos;ve checked in!</h4>
                <p>Transaction submitted. Refresh in a few moments.</p>
              </div>
            ) : (
              <div className={styles.checkinAction}>
                <div className={styles.checkinDescription}>
                  Support the project and record your daily activity on the Stacks blockchain.
                </div>
                <div className={styles.feeRewardInfo}>
                  <div className={styles.feeBox}>
                    <span className={styles.label}>Checkin Fee</span>
                    <span className={styles.amount}>0.10 STX</span>
                  </div>
                </div>
                <button
                  className={styles.checkinButton}
                  onClick={handleCheckin}
                  disabled={isCheckingIn || isLoading}
                >
                  {isCheckingIn
                    ? 'Processing...'
                    : isLoading
                      ? 'Loading...'
                      : 'Check In Now'}
                </button>
              </div>
            )}
          </div>

          {userStats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statValue}>
                  {userStats['total-checkins'].value}
                </div>
                <div className={styles.statLabel}>Total Checkins</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🕒</div>
                <div className={styles.statValue}>
                  {userStats['last-checkin-day'].value === '0' ? 'None' : `#${userStats['last-checkin-day'].value}`}
                </div>
                <div className={styles.statLabel}>Last Checkin Block</div>
              </div>
            </div>
          )}

          <div className={styles.infoSection}>
            <h4>About Stacks Daily Checkin</h4>
            <p>
              This checkin app allows you to record your presence on-chain.
              Each checkin helps build your on-chain reputation and supports the ecosystem.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

