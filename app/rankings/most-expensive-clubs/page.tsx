import { Suspense } from 'react';

import ClubValuationsPageClient from './page-client';

export default function ClubValuationsPage() {
  return (
    <Suspense fallback={null}>
      <ClubValuationsPageClient />
    </Suspense>
  );
}
