// Layout to ensure this route is dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

