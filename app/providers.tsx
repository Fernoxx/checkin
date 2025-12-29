'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StacksProvider>{children}</StacksProvider>
    </QueryClientProvider>
  );
}

function StacksProvider({ children }: { children: React.ReactNode }) {
  // Stacks Connect v8 doesn't use a Connect component wrapper
  // Authentication is handled via the authenticate() function
  return <>{children}</>;
}

