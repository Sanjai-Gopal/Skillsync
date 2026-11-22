import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'SkillSync | Build a stronger hackathon team before the first line of code',
  description:
    'Opt-in talent graph with an explainable compatibility engine that rewards complementary skill coverage over popularity. Innovate India 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/70 bg-card/60 py-8 px-4 text-center text-xs text-muted-foreground">
          <div className="container max-w-5xl mx-auto space-y-2">
            <p className="font-semibold text-foreground/80">
              SkillSync • Team Nexus • Innovate India 2026 Hackathon Prototype
            </p>
            <p className="max-w-xl mx-auto text-[11px] leading-relaxed">
              Safe by design: Never uses gender, age, college, name, or location (except timezone) as scoring inputs.
              A score is a guide, not a verdict. You decide whom to invite.
            </p>
          </div>
        </footer>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
