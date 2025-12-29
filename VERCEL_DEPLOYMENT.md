# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Install Dependencies Locally
```bash
npm install
```

### 2. Environment Variables Setup

Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required:
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Your contract address (format: `ADDRESS.NAME`)
- `NEXT_PUBLIC_NETWORK` - `testnet` or `mainnet`

#### Optional:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - For WalletConnect support
- `CHAINHOOK_AUTH_SECRET` - For chainhook webhook security

See `VERCEL_ENV.md` for detailed instructions.

### 3. Build Test Locally
```bash
npm run build
```

If build succeeds, you're ready to deploy!

## Deploy to Vercel

### Option 1: Via Vercel Dashboard
1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables in settings
6. Deploy!

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Post-Deployment

### 1. Update Chainhook Webhook URL
If using chainhooks, update the webhook URL in your chainhook configuration:
```
https://your-app.vercel.app/api/chainhook
```

### 2. Verify Environment Variables
Check that all `NEXT_PUBLIC_*` variables are accessible in the browser:
- Open browser console
- Check `process.env.NEXT_PUBLIC_CONTRACT_ADDRESS`

### 3. Test Wallet Connection
- Test Xverse wallet connection
- Test Leather wallet connection
- Test WalletConnect (if Project ID added)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check for TypeScript errors: `npm run lint`

### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check variable names match exactly

### Wallet Connection Issues
- Verify contract address is correct
- Check network matches contract deployment
- Ensure wallet extension is installed

## Dependencies Verification

All dependencies are listed in `package.json`. Key dependencies:
- ✅ Next.js 16
- ✅ React 19
- ✅ Stacks Connect 8.2.3
- ✅ Reown AppKit 1.8.15
- ✅ All required packages

Run `npm install` to ensure all are installed.

