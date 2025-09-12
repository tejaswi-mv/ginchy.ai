import DashboardHeader from './header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <DashboardHeader />
      {children}
    </section>
  );
}