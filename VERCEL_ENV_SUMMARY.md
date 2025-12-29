# Vercel Environment Variables - Quick Reference

## Required Variables (Add to Vercel)

### 1. Contract Address
```
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.checkin
```
- **Format**: `ADDRESS.CONTRACT_NAME`
- **Required**: ✅ Yes

### 2. Network
```
NEXT_PUBLIC_NETWORK=testnet
```
- **Options**: `testnet` or `mainnet`
- **Required**: ✅ Yes

## Optional Variables

### 3. WalletConnect Project ID (REQUIRED for WalletConnect)
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```
- **Get from**: https://cloud.reown.com
- **Required**: ✅ **YES** (if you want WalletConnect/Reown AppKit to work)
- **Note**: Stacks Connect works without this, but WalletConnect button will be disabled

### 4. Chainhook Auth Secret
```
CHAINHOOK_AUTH_SECRET=your-secret-here
```
- **Required**: ❌ No (only if using chainhook webhooks)

## How to Add in Vercel

1. Go to: **Project Settings** → **Environment Variables**
2. Add each variable
3. Select environments: **Production**, **Preview**, **Development**
4. Click **Save**
5. **Redeploy** your project

## Summary

**Minimum Required:**
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_NETWORK`

**Recommended:**
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (for WalletConnect support)

**Optional:**
- `CHAINHOOK_AUTH_SECRET` (for webhook security)

