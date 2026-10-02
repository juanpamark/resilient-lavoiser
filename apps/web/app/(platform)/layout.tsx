import React from 'react';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="platform-layout">
      {/* Platform Dashboard Layout Shell (Agency Admin) */}
      {children}
    </div>
  );
}
