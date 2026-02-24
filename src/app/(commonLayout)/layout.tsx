export default function CommonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
    common layout
    {children}
    </>
  );
}