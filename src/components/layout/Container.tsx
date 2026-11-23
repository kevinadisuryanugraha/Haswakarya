import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Satu-satunya sumber lebar konten situs publik.
 *
 * Sebelumnya tiap bagian memilih sendiri: Header `max-w-7xl` (1280px) +
 * `2xl:max-w-[1440px]`, sebagian section `max-w-6xl` (1152px), FAQ
 * `max-w-5xl` (1024px), dan padding horizontal dipasang di elemen `<section>`
 * bukan di kontainer. Akibatnya tepi kiri/kanan teks bergeser 64–128px antar
 * bagian saat digulir — terlihat "goyang" di layar lebar.
 *
 * Aturan sekarang:
 *   - lebar maksimum 1280px (sama dengan `max-w-7xl`),
 *   - padding horizontal `1rem` → `1.5rem` (sm) → `2rem` (lg),
 *   - dipasang di SATU elemen pembungkus, bukan di `<section>`.
 *
 * Semua blok konten (Header, TopBar, setiap section beranda, CTA, Footer,
 * halaman Join as Crew) wajib memakai komponen ini agar tepi kiri/kanan
 * presisi dari atas sampai bawah.
 */
type ContainerProps<T extends ElementType = 'div'> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'>;

export function Container<T extends ElementType = 'div'>({
  as,
  children,
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      className={cn('site-container', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}