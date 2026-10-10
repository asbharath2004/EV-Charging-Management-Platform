import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Zap,
  LayoutDashboard,
  MapPin,
  Car,
  Calendar,
  BatteryCharging,
  CreditCard,
  User,
  Shield,
  Truck,
  LogOut,
  X,
  Cpu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Build role-specific navigation menu items
  const getNavItems = (userRole) => {
    switch (userRole) {
      case "STATION_HOST":
        return [
          { path: "/host/dashboard", label: "Host Dashboard", icon: LayoutDashboard },
          { path: "/host/stations", label: "My Stations", icon: MapPin },
          { path: "/bookings", label: "Bookings", icon: Calendar },
          { path: "/charging-sessions", label: "Charging Sessions", icon: BatteryCharging },
          { path: "/payments", label: "Revenue", icon: CreditCard },
          { path: "/profile", label: "Profile", icon: User }
        ];
      case "FLEET_OPERATOR":
        return [
          { path: "/fleet/dashboard", label: "Fleet Dashboard", icon: LayoutDashboard },
          { path: "/vehicles", label: "Fleet Vehicles", icon: Truck },
          { path: "/bookings", label: "Fleet Bookings", icon: Calendar },
          { path: "/charging-sessions", label: "Charging History", icon: BatteryCharging },
          { path: "/payments", label: "Payments", icon: CreditCard },
          { path: "/profile", label: "Profile", icon: User }
        ];
      case "ADMIN":
        return [
          { path: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
          { path: "/stations", label: "Stations Hub", icon: MapPin },
          { path: "/admin/dashboard#port-requests", label: "Port Requests", icon: Cpu },
          { path: "/vehicles", label: "Vehicles", icon: Car },
          { path: "/bookings", label: "Bookings", icon: Calendar },
          { path: "/charging-sessions", label: "Sessions", icon: BatteryCharging },
          { path: "/payments", label: "Payments Log", icon: CreditCard },
          { path: "/profile", label: "Profile", icon: User }
        ];
      default: // USER
        return [
          { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/stations", label: "Stations", icon: MapPin },
          { path: "/vehicles", label: "My Vehicles", icon: Car },
          { path: "/bookings", label: "Bookings", icon: Calendar },
          { path: "/charging-sessions", label: "Charging Sessions", icon: BatteryCharging },
          { path: "/battery-life", label: "Battery Life", icon: BatteryCharging },
          { path: "/payments", label: "Payments", icon: CreditCard },
          { path: "/profile", label: "Profile", icon: User }
        ];
    }
  };

  const navItems = getNavItems(role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40
          }}
        />
      )}

      <aside
        style={{
          width: "260px",
          height: "100vh",
          backgroundColor: "var(--dark)",
          color: "var(--white)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : undefined,
          transition: "transform 0.3s ease",
          boxShadow: "4px 0 15px rgba(0,0,0,0.2)"
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "var(--primary-yellow)",
                color: "var(--dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-yellow)"
              }}
            >
              <Zap size={24} fill="var(--dark)" strokeWidth={2.5} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  color: "var(--white)"
                }}
              >
                EV <span style={{ color: "var(--primary-yellow)" }}>CHARGE</span>
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  letterSpacing: "1px",
                  textTransform: "uppercase"
                }}
              >
                MOBILITY PORTAL
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mobile-only"
            style={{
              background: "none",
              border: "none",
              color: "var(--white)",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: "20px 12px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: "700",
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              paddingLeft: "12px",
              marginBottom: "12px"
            }}
          >
            {role ? `${role.replace("_", " ")} NAVIGATION` : "NAVIGATION"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.9rem",
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "var(--dark)" : "#94A3B8",
                    backgroundColor: isActive ? "var(--primary-yellow)" : "transparent",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                    boxShadow: isActive ? "var(--shadow-yellow)" : "none"
                  })}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(0, 0, 0, 0.2)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", marginBottom: "12px", padding: "8px 12px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-yellow)",
                  color: "var(--dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "0.85rem"
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--white)", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {user?.name || "EV User"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--primary-yellow-dark)", fontWeight: "600" }}>
                  {role || "USER"}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#FCA5A5",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
