import React from 'react';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="business-layout">
      {/* Business Dashboard Layout Shell (Tenant Owner, Admin, Staff) */}
      {children}
    </div>
  );
}
