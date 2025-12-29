'use client';

import { Connect } from '@stacks/connect';
import { AppConfig, UserSession } from '@stacks/connect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';

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

const queryClient = new QueryClient();

// Initialize Reown AppKit if Project ID is provided
// Note: Reown AppKit requires a Project ID to function
let wagmiConfig: any = null;
if (projectId && projectId.length > 0) {
  try {
    wagmiConfig = createAppKit({
      adapters: [],
      networks: [],
      projectId,
      metadata,
      features: {
        analytics: true,
        email: false,
        socials: false,
      },
    });
  } catch (error) {
    console.warn('Failed to initialize Reown AppKit. Project ID may be invalid:', error);
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {wagmiConfig ? (
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <StacksProvider>{children}</StacksProvider>
          </QueryClientProvider>
        </WagmiProvider>
      ) : (
        <StacksProvider>{children}</StacksProvider>
      )}
    </>
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

