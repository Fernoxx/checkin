# Contract Verification Guide

## Your Deployed Contract

**Address**: `SP2MT5CDNVWS10W834069Q3GZWVDT9ATB91GTZPBV.checkin`  
**Network**: Mainnet

## How to Verify Your Contract

1. **View on Stacks Explorer**:
   - Go to: https://explorer.stacks.co/txid/[your-deployment-tx]?chain=mainnet
   - Or search for: `SP2MT5CDNVWS10W834069Q3GZWVDT9ATB91GTZPBV.checkin`

2. **Check the Contract Code**:
   - Compare the deployed code with `contracts/checkin.clar` in this repo
   - Key functions to verify:
     - `daily-check-in` - Should have `asserts! (not already-checked-in)` on line 47
     - Should check `has-claimed-initial` on line 44
     - Should set `reward-claimed-initial` to true on line 64

## What Should Be in Your Contract

✅ **Line 47**: `(asserts! (not already-checked-in) err-already-checked-in)` - Prevents multiple check-ins per day  
✅ **Line 44**: `(has-claimed-initial (default-to false (map-get? reward-claimed-initial caller)))` - Checks if initial reward claimed  
✅ **Line 49**: `(if (not has-claimed-initial)` - Only gives initial reward once  
✅ **Line 64**: `(map-set reward-claimed-initial caller true)` - Marks initial as claimed  
✅ **Line 86**: `(map-set check-in-status { user: caller, day: current-day } true)` - Marks daily check-in

## If Contract Needs Redeployment

If your deployed contract doesn't match the code in `contracts/checkin.clar`, you'll need to:

1. **Deploy the correct contract**:
   ```bash
   # Using Clarinet
   clarinet deploy --mainnet
   
   # Or using Stacks CLI
   stacks deploy checkin contracts/checkin.clar --mainnet
   ```

2. **Update the contract address** in:
   - Vercel environment variable: `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - Or it will use the default: `SP2MT5CDNVWS10W834069Q3GZWVDT9ATB91GTZPBV.checkin`

## Testing the Contract

After the frontend fix (PostConditionMode.Allow), test:

1. **First check-in**: Should pay 1 STX, receive 1.5 STX (one-time only)
2. **Second check-in same day**: Should fail with "already-checked-in" error
3. **Next day check-in**: Should pay 0.2 STX, receive 0.25 STX
4. **Multiple check-ins same day**: Should all fail after the first one

