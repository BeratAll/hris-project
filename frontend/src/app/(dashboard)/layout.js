import MainLayout from '@/components/layout/MainLayout';

/**
 * Dashboard Route Group Layout
 *
 * (dashboard) route grubundaki tüm sayfalar MainLayout
 * (Sidebar + Header) içinde render edilir.
 */
export default function DashboardLayout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
