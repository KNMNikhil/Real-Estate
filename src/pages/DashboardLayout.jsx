import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import Footer from "../components/Footer";

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <DashboardHeader />
      <main className="container page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
