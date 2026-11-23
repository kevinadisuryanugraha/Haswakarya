import React from 'react';
import { PortalShell } from '@/components/portal/PortalShell';

export default function PortalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
