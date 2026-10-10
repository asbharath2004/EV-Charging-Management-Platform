import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: window.innerWidth >= 1024 ? "260px" : "0px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto"
          }}
        >
          <Outlet />
        </main>

        <footer
          style={{
            padding: "16px 24px",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "var(--white)"
          }}
        >
          © 2026 EV Charging Management Platform. Designed with ⚡ Premium Electric Mobility Theme.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
