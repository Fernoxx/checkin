# Vercel Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project settings:

### 1. Contract Configuration (REQUIRED)

```
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.checkin
```
- **Description**: Your deployed Stacks contract address
- **Format**: `ADDRESS.CONTRACT_NAME`
- **Example**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.checkin`
- **Required**: ✅ Yes

```
NEXT_PUBLIC_NETWORK=testnet
```
- **Description**: Stacks network to use
- **Options**: `testnet` or `mainnet`
- **Default**: `testnet`
- **Required**: ✅ Yes

### 2. WalletConnect/Reown AppKit (OPTIONAL)

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
```
- **Description**: WalletConnect Project ID from Reown Cloud
- **How to get**: 
  1. Visit https://cloud.reown.com
  2. Sign up/Login
  3. Create a new project
  4. Copy the Project ID
- **Required**: ❌ No (only needed for WalletConnect support)
- **Note**: Stacks Connect (Xverse/Leather) works without this

### 3. Chainhook Webhook (OPTIONAL)

```
CHAINHOOK_AUTH_SECRET=your-secret-here
```
- **Description**: Authentication secret for chainhook webhook endpoint
- **Used in**: `/app/api/chainhook/route.ts`
- **Required**: ❌ No (only if using chainhook webhooks)
- **Security**: Use a strong random string

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: Variable name (e.g., `NEXT_PUBLIC_CONTRACT_ADDRESS`)
   - **Value**: Variable value
   - **Environment**: Select which environments (Production, Preview, Development)
4. Click **Save**

## Environment-Specific Values

You can set different values for different environments:

### Production
```
NEXT_PUBLIC_CONTRACT_ADDRESS=SP...mainnet-address.checkin
NEXT_PUBLIC_NETWORK=mainnet
```

### Preview/Development
```
NEXT_PUBLIC_CONTRACT_ADDRESS=ST...testnet-address.checkin
NEXT_PUBLIC_NETWORK=testnet
```

## Quick Setup Checklist

- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` - Your deployed contract
- [ ] `NEXT_PUBLIC_NETWORK` - `testnet` or `mainnet`
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - (Optional) From Reown Cloud
- [ ] `CHAINHOOK_AUTH_SECRET` - (Optional) For webhook security

## After Adding Variables

1. **Redeploy** your Vercel project for changes to take effect
2. Variables starting with `NEXT_PUBLIC_` are exposed to the browser
3. Other variables are server-side only

## Testing

After deployment, verify:
- ✅ Wallet connection works
- ✅ Contract address is correct
- ✅ Network matches your contract deployment
- ✅ WalletConnect works (if Project ID added)

