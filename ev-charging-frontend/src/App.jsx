import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import HostDashboard from "./pages/HostDashboard";
import FleetDashboard from "./pages/FleetDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Stations from "./pages/Stations";
import StationDetails from "./pages/StationDetails";
import Vehicles from "./pages/Vehicles";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import ChargingSessions from "./pages/ChargingSessions";
import BatteryLife from "./pages/BatteryLife";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Layout Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Role Specific Dashboards */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="host/dashboard"
              element={
                <ProtectedRoute allowedRoles={["STATION_HOST"]}>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="fleet/dashboard"
              element={
                <ProtectedRoute allowedRoles={["FLEET_OPERATOR"]}>
                  <FleetDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Resource Pages */}
            <Route
              path="stations"
              element={
                <ProtectedRoute>
                  <Stations />
                </ProtectedRoute>
              }
            />
            <Route
              path="host/stations"
              element={
                <ProtectedRoute allowedRoles={["STATION_HOST"]}>
                  <Stations />
                </ProtectedRoute>
              }
            />
            <Route
              path="host/station-approval"
              element={
                <ProtectedRoute allowedRoles={["STATION_HOST"]}>
                  <Stations />
                </ProtectedRoute>
              }
            />
            <Route
              path="stations/:id"
              element={
                <ProtectedRoute>
                  <StationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="vehicles"
              element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="charging-sessions"
              element={
                <ProtectedRoute>
                  <ChargingSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="charging-sessions/:id"
              element={
                <ProtectedRoute>
                  <ChargingSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="battery-life"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <BatteryLife />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
