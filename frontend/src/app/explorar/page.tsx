'use client';

import { useRouter } from 'next/navigation';
import { TarotistasExplorer } from '@/components/features/marketplace';

/**
 * Explorar Page - Tarotistas Marketplace
 *
 * Public page that displays the marketplace of tarotistas.
 * All business logic is delegated to TarotistasExplorer component.
 */
export default function ExplorarPage() {
  const router = useRouter();

  const handleViewProfile = (id: number) => {
    router.push(`/tarotistas/${id}`);
  };

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <TarotistasExplorer onViewProfile={handleViewProfile} />
    </div>
  );
}
