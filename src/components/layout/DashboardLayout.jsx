import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page content */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 