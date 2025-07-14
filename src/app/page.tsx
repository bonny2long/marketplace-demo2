import ItemGrid from '@/components/marketplace/ItemGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mockbook Marketplace",
  description: "Discover and sell items on Mockbook&apos;s Marketplace.", // Fixed: Used &apos;
};

export default function HomePage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <ItemGrid />
    </div>
  );
}
