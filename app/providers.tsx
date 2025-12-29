'use client';

import { Connect } from '@stacks/connect';
import { AppConfig, UserSession } from '@stacks/connect';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia } from 'wagmi/chains';
import { createAppKit } from '@reown/appkit/react';

// Stacks Connect configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// Reown AppKit configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const metadata = {
  name: 'Stacks Xverse Checkin',
  description: 'Daily checkin app for Stacks Builder Rewards',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: [`${typeof window !== 'undefined' ? window.location.origin : ''}/icon.png`],
};

// Create basic Wagmi config for Reown AppKit (when Project ID is provided)
const queryClient = new QueryClient();

// Create Wagmi config (simplified for now - Reown AppKit will enhance this)
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // For now, we'll use Stacks Connect as primary
  // Reown AppKit integration can be added when Project ID is configured
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <StacksProvider>{children}</StacksProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function StacksProvider({ children }: { children: React.ReactNode }) {
  return (
    <Connect
      authOptions={{
        appDetails: {
          name: 'Stacks Xverse Checkin',
          icon: typeof window !== 'undefined' ? window.location.origin + '/icon.png' : '',
        },
        redirectTo: '/',
        onFinish: () => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        },
        userSession,
      }}
    >
      {children}
    </Connect>
  );
}

