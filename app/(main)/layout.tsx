import { LenisProvider } from '@/lib/scroll/LenisProvider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <LenisProvider>{children}</LenisProvider>
}
