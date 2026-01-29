'use client';

import { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { Providers } from './providers';

// Disable static generation - this page needs to be dynamic
export const dynamic = 'force-dynamic';

// Dynamically import components that use Stacks Connect (client-only)
const CheckinDashboard = dynamicImport(() => import('@/components/CheckinDashboard'), { 
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard...</div>
});
const WalletSelector = dynamicImport(() => import('@/components/WalletSelector'), { 
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem' }}>Loading wallet selector...</div>
});

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    let mounted = true;
  

          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>Built for Stacks Builder Rewards by Talent App</p>
          </div>
        </footer>
      </div>
  );
}
