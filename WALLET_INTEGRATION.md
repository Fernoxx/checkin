# Wallet Integration Guide

## Overview

This app supports multiple wallet connection methods:

1. **Stacks Connect** (Primary) - For Xverse, Leather, and other Stacks wallets
2. **Reown AppKit** (Future) - For WalletConnect protocol and 600+ wallets

## Current Implementation

### Stacks Connect (Active)

**Supported Wallets:**
- ✅ Xverse Wallet
- ✅ Leather Wallet
- ✅ Any Stacks-compatible wallet

**How it works:**
- Uses `@stacks/connect-react` for wallet connections
- Direct integration with Stacks wallet extensions
- No additional configuration needed

### Reown AppKit (Infrastructure Ready)

**Supported Wallets (when configured):**
- 🔄 600+ wallets via WalletConnect protocol
- Requires WalletConnect Project ID

**Setup Required:**
1. Get a Project ID from [Reown Cloud](https://cloud.reown.com)
2. Add to `.env.local`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id`
3. Uncomment Reown AppKit code in `components/WalletSelector.tsx`

## Wallet Selector Component

The `WalletSelector` component provides a unified interface for connecting wallets:

- **Stacks Wallets** button - Connects via Stacks Connect (Xverse/Leather)
- **WalletConnect** button - Connects via Reown AppKit (when configured)

## Implementation Details

### Stacks Connect Flow

```typescript
// User clicks "Connect via Stacks"
→ Opens Stacks Connect modal
→ User selects Xverse or Leather
→ Wallet extension prompts for connection
→ User approves
→ Wallet connected
```

### Reown AppKit Flow (Future)

```typescript
// User clicks "Connect via WalletConnect"
→ Opens Reown AppKit modal
→ Shows 600+ wallet options
→ User selects wallet
→ QR code or deep link shown
→ User connects via mobile app or extension
→ Wallet connected
```

## References

- [Stacks Connect Docs](https://docs.stacks.co/build-apps/references/connect)
- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [WalletConnect Docs](https://docs.walletconnect.network/wallet-sdk/overview)

