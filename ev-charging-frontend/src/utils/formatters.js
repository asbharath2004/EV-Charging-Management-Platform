/**
 * Format money in Indian Rupee format
 * Example: ₹240.00
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format LocalDateTime string into user friendly format
 * Example: 2026-08-28T10:00:00 -> 28 Aug 2026, 10:00 AM
 */
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return dateTimeStr;
  }
};

/**
 * Format Date only
 * Example: 28 Aug 2026
 */
export const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return dateTimeStr;
  }
};

/**
 * Format Time only
 * Example: 10:00 AM
 */
export const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return dateTimeStr;
  }
};

/**
 * Battery level color helper
 * 0-20 = red (#EF4444)
 * 21-50 = orange (#F97316)
 * 51-100 = green (#22C55E)
 */
export const getBatteryColorClass = (percentage) => {
  const p = Number(percentage) || 0;
  if (p <= 20) return "battery-red";
  if (p <= 50) return "battery-orange";
  return "battery-green";
};

export const getBatteryColorHex = (percentage) => {
  const p = Number(percentage) || 0;
  if (p <= 20) return "#EF4444";
  if (p <= 50) return "#F97316";
  return "#22C55E";
};
