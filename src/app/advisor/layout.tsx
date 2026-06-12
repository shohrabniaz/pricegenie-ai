export default function AdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="advisor-shell flex min-h-0 flex-1 flex-col">{children}</div>;
}
