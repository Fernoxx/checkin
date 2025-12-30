import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stacks Xverse Checkin - Builder Rewards',
  description: 'Daily checkin app for Stacks Xverse wallet users - Stacks Builder Rewards by Talent App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}
      </body>
    </html>
  );
}

