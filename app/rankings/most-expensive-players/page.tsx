import { Suspense } from 'react';

import TopPlayersPageClient from './page-client';

export default function TopPlayersPage() {
  return (
    <Suspense fallback={null}>
      <TopPlayersPageClient />
    </Suspense>
  );
}
