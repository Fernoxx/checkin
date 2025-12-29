export interface UserData {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
  };
}

export interface FeeSummary {
  'fee-initial': { value: string };
  'reward-initial': { value: string };
  'fee-daily': { value: string };
  'reward-daily': { value: string };
  'total-fees-collected'?: { value: string };
  'total-rewards-distributed'?: { value: string };
  'current-reward-pool'?: { value: string };
  'contract-active'?: { value: boolean | string };
}

export interface UserStats {
  'total-checkins': { value: string };
  'last-checkin-day': { value: string };
}

export interface TierInfo {
  tier: number;
  name: string;
  fee: string;
  reward: string;
  color: string;
}

