# Deployment Guide

## Smart Contract Deployment

### Prerequisites

1. Install Clarinet:
```bash
npm install -g @stacks/clarinet
```

2. Install Stacks CLI (optional, for manual deployment):
```bash
npm install -g @stacks/cli
```

### Using Clarinet

1. Initialize Clarinet in your project (if not already done):
```bash
clarinet init
```

2. Add your contract to Clarinet:
```bash
clarinet contract new checkin
```

3. Copy the contract code to `contracts/checkin.clar`

4. Deploy to testnet:
```bash
clarinet deploy --testnet
```

5. Deploy to mainnet:
```bash
clarinet deploy --mainnet
```

### Manual Deployment via Stacks CLI

1. Prepare your deployment:
```bash
stacks deploy checkin contracts/checkin.clar --testnet
```

2. Follow the prompts to sign the transaction with your wallet

3. Copy the deployed contract address and update it in `src/components/CheckinDashboard.tsx`

## Frontend Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

### Environment Variables

No environment variables are required for basic functionality. The contract address is hardcoded in the component, but you can make it configurable by:

1. Creating a `.env` file:
```
VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
VITE_NETWORK=testnet
```

2. Updating `CheckinDashboard.tsx` to use environment variables:
```typescript
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
const NETWORK = import.meta.env.VITE_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
```

## Post-Deployment Checklist

- [ ] Update contract address in `CheckinDashboard.tsx`
- [ ] Verify network (testnet/mainnet) is correct
- [ ] Test wallet connection
- [ ] Test checkin functionality
- [ ] Verify on-chain transactions
- [ ] Update README with deployed contract address
- [ ] Share with Stacks Builder Rewards team

