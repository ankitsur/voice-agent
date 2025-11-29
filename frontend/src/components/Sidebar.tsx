import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`block px-5 py-3 rounded-lg mt-2 
         ${pathname === to
          ? "bg-blue-600 text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="w-64 fixed top-0 left-0 h-full p-5 bg-gray-100 dark:bg-slate-900 shadow">
      <h2 className="text-xl font-bold dark:text-white">AI Dashboard</h2>

      <div className="mt-8 space-y-1">
        {link("/home", "Home")}
        {link("/agent-configs", "Agent Configurations")}
        {link("/test-call", "Start Call")}
        {link("/call-results", "Call Results")}
      </div>
    </div>
  );
}
