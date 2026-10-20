import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <DashboardHeader />
      <main className="container page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Living Gods Real Estates · www.livingarts.in</p>
      </footer>
    </div>
  );
}
