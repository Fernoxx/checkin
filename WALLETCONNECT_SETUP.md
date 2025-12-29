# WalletConnect/Reown AppKit Setup Guide

## Important: Project ID is REQUIRED

**The WalletConnect Project ID is REQUIRED** if you want to use WalletConnect/Reown AppKit functionality. 

### Why It's "Optional" in Documentation

The Project ID is marked as "optional" in some docs because:
- ✅ **Stacks Connect works without it** - Xverse and Leather wallets connect via Stacks Connect
- ❌ **WalletConnect REQUIRES it** - Reown AppKit cannot function without a valid Project ID

### What Happens Without Project ID

- ✅ Stacks Connect button works (Xverse/Leather)
- ❌ WalletConnect button is **disabled**
- ⚠️ Users see "Project ID Required" message

### What Happens With Project ID

- ✅ Stacks Connect button works (Xverse/Leather)
- ✅ WalletConnect button works (600+ wallets)
- ✅ Full multi-wallet support enabled

## How to Get Project ID

1. **Visit**: https://cloud.reown.com
2. **Sign up/Login** with your account
3. **Create a new project**:
   - Click "Create Project"
   - Enter project name (e.g., "Stacks Checkin App")
   - Select your use case
4. **Copy the Project ID**:
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - Copy the entire string

## Add to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   Name: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
   Value: your-project-id-here
   ```
3. Select all environments (Production, Preview, Development)
4. **Save** and **Redeploy**

## Verify It's Working

After adding the Project ID and redeploying:

1. Open your app
2. Click "Connect Wallet"
3. The "Connect via WalletConnect" button should be **enabled** (not grayed out)
4. Clicking it should open the Reown AppKit modal with 600+ wallet options

## Troubleshooting

### Button Still Disabled
- ✅ Check Project ID is in Vercel environment variables
- ✅ Verify variable name is exactly: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- ✅ Ensure you redeployed after adding the variable
- ✅ Check browser console for errors

### Modal Doesn't Open
- ✅ Verify Project ID is valid (not empty, correct format)
- ✅ Check browser console for Reown AppKit errors
- ✅ Ensure you're using HTTPS (required for WalletConnect)

## Summary

| Feature | Without Project ID | With Project ID |
|---------|-------------------|-----------------|
| Stacks Connect (Xverse/Leather) | ✅ Works | ✅ Works |
| WalletConnect (600+ wallets) | ❌ Disabled | ✅ Works |
| Reown AppKit | ❌ Not initialized | ✅ Fully functional |

**Bottom Line**: Add the Project ID to enable WalletConnect functionality!

