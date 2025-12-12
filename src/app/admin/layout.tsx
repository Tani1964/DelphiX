import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/admin"
                className="flex items-center px-2 py-2 text-xl font-bold text-blue-600"
              >
                Admin Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

