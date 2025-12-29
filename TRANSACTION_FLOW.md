# Transaction Flow Documentation

## How Checkin Transactions Work

### Contract Behavior

The `daily-check-in` function in `checkin.clar` handles all STX transfers internally:

#### Tier 1 (First Time - Welcome Bonus)
1. User calls `daily-check-in()`
2. Contract checks if user has claimed initial reward
3. Contract transfers **1.0 STX FROM user TO contract** (fee)
4. Contract transfers **1.5 STX FROM contract TO user** (reward)
5. User receives **0.5 STX net profit**

#### Tier 2 (Daily Checkin)
1. User calls `daily-check-in()`
2. Contract checks if user has already checked in today
3. Contract transfers **0.2 STX FROM user TO contract** (fee)
4. Contract transfers **0.25 STX FROM contract TO user** (reward)
5. User receives **0.05 STX net profit**

### Frontend Implementation

The frontend uses `doContractCall` from Stacks Connect:

```typescript
await doContractCall({
  network: NETWORK,
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: 'daily-check-in',
  functionArgs: [],
  onFinish: (data) => {
    // Transaction successful
    // User has paid fee and received reward
  },
});
```

### What Happens in the Wallet

1. **User clicks "Check In Now"**
2. **Wallet shows transaction preview**:
   - Function: `daily-check-in`
   - Contract: `ADDRESS.checkin`
   - Estimated fee: Network transaction fee (~0.0001 STX)
   - **Note**: The 1 STX or 0.2 STX fee is handled INSIDE the contract, not as an attached payment
3. **User approves transaction**
4. **Transaction is broadcast to Stacks network**
5. **Contract executes**:
   - Transfers fee from user to contract
   - Transfers reward from contract to user
   - Updates checkin status
   - Updates user stats
6. **Transaction confirmed** → Frontend refreshes data

### Important Notes

- ✅ **No attached STX needed**: The contract handles all STX transfers internally
- ✅ **Wallet shows transaction details**: User sees what function is being called
- ✅ **Automatic fee/reward**: Contract logic determines tier and handles transfers
- ⚠️ **User needs sufficient balance**: Must have fee amount + network fees
- ⚠️ **Reward pool must be funded**: Contract owner must fund the reward pool

### Transaction Requirements

**For Tier 1 (First Checkin):**
- User needs: **1.0 STX** (fee) + **~0.0001 STX** (network fee) = **~1.0001 STX**
- Contract needs: **1.5 STX** in reward pool
- User receives: **1.5 STX** (net: +0.5 STX)

**For Tier 2 (Daily Checkin):**
- User needs: **0.2 STX** (fee) + **~0.0001 STX** (network fee) = **~0.2001 STX**
- Contract needs: **0.25 STX** in reward pool
- User receives: **0.25 STX** (net: +0.05 STX)

### Verification

After transaction:
1. Check user's STX balance (should increase by reward amount minus fee)
2. Check contract's reward pool (should decrease by reward amount)
3. Check user stats (total checkins should increment)
4. Check checkin status (should show checked in for today)

### Error Handling

The contract will fail if:
- ❌ User already checked in today
- ❌ Contract reward pool is insufficient
- ❌ User doesn't have enough STX for fee
- ❌ Contract is inactive

Frontend handles these errors and shows appropriate messages to the user.

