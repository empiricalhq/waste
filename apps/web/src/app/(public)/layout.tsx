import { Navigation } from '@/components/shared/navigation';
import { marketingTheme } from '@/config/marketing';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-theme">
      <Navigation navLinks={marketingTheme.navLinks} showAuth={true} />
      {children}
    </div>
  );
}
