import { AppProvider } from '@/lib/app-context';
import { KisaanKavachApp } from '@/components/kisaan-kavach-app';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-muted to-background">
      <AppProvider>
        <KisaanKavachApp />
      </AppProvider>
    </main>
  );
}
