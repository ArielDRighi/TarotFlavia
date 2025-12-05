interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <div className="bg-primary/10 text-primary px-4 py-2 text-center text-sm font-medium">
        Panel de Administración
      </div>
      {children}
    </>
  );
}
