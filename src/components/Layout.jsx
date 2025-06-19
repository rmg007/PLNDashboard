import { Outlet, NavLink } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';

export default function Layout() {
  const { title } = useLayout();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold">{title}</h1>
        <nav className="space-x-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'font-semibold text-blue-500 dark:text-blue-400' : ''
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/uniquepermits"
            title="Unique Permits Analysis"
            className={({ isActive }) =>
              isActive ? 'font-semibold text-blue-500 dark:text-blue-400' : ''
            }
          >
            Permits Analysis
          </NavLink>
          <NavLink
            to="/deptactivity"
            title="Department Activity Analysis"
            className={({ isActive }) =>
              isActive ? 'font-semibold text-blue-500 dark:text-blue-400' : ''
            }
          >
            Dept Activity
          </NavLink>
        </nav>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
