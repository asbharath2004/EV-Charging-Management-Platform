import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Zap, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      style={{
        height: "70px",
        backgroundColor: "var(--white)",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px"
      }}
    >
      {/* Left: Mobile Toggle & Page Title/Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar Menu"
          style={{
            padding: "8px",
            borderRadius: "8px",
            color: "var(--dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-color)"
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--primary-yellow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Zap size={18} fill="var(--dark)" color="var(--dark)" />
          </div>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.15rem",
              fontWeight: "800",
              color: "var(--dark)",
              letterSpacing: "-0.01em"
            }}
          >
            ⚡ EV Charge
          </span>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: 1,
          maxWidth: "400px",
          margin: "0 24px",
          position: "relative"
        }}
      >
        <Search
          size={18}
          color="var(--text-light)"
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)"
          }}
        />
        <input
          type="text"
          placeholder="Search charging stations, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 14px 9px 40px",
            borderRadius: "999px",
            border: "1px solid var(--border-color)",
            backgroundColor: "#F8FAFC",
            fontSize: "0.875rem",
            outline: "none"
          }}
        />
      </form>

      {/* Right: Actions & User Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          aria-label="Notifications"
          style={{
            position: "relative",
            padding: "8px",
            borderRadius: "50%",
            color: "var(--text-main)",
            backgroundColor: "#F1F5F9"
          }}
        >
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--danger)"
            }}
          />
        </button>

        <Link
          to="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--white)",
            transition: "var(--transition)"
          }}
        >
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
              fontSize: "0.875rem"
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--dark)" }}>
            {user?.name || "Bharath"}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
