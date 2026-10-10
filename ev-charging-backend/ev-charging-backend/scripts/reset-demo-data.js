// Run only as an explicit demo reset with EV_DEMO_RESET_CONFIRM and EV_DEMO_PASSWORD_HASH set.

if (process.env.EV_DEMO_RESET_CONFIRM !== "RESET_EV_DEMO_DATA") {
  throw new Error("Refusing to reset data. Set EV_DEMO_RESET_CONFIRM=RESET_EV_DEMO_DATA explicitly.");
}

const demoPasswordHash = process.env.EV_DEMO_PASSWORD_HASH;
if (!demoPasswordHash) {
  throw new Error("Set EV_DEMO_PASSWORD_HASH to a bcrypt hash before resetting demo data.");
}
const now = new Date("2026-09-11T09:00:00.000Z");
const pastStart = new Date("2026-09-08T06:00:00.000Z");
const pastEnd = new Date("2026-09-08T07:10:00.000Z");
const futureStart = new Date("2026-09-14T10:00:00.000Z");
const futureEnd = new Date("2026-09-14T11:00:00.000Z");
const laterStart = new Date("2026-09-16T15:00:00.000Z");
const laterEnd = new Date("2026-09-16T16:00:00.000Z");

const users = [
  {
    _id: "user-evdriver-001",
    name: "EV Driver",
    email: "evuser@example.com",
    phone: "9876543210",
    password: demoPasswordHash,
    role: "USER"
  },
  {
    _id: "user-evdriver-002",
    name: "Arun Kumar",
    email: "arun@example.com",
    phone: "9876543211",
    password: demoPasswordHash,
    role: "USER"
  },
  {
    _id: "user-stationhost-001",
    name: "NavinHost",
    email: "navin@example.com",
    phone: "9876543212",
    password: demoPasswordHash,
    role: "STATION_HOST"
  },
  {
    _id: "user-stationhost-002",
    name: "GreenCharge Host",
    email: "greenhost@example.com",
    phone: "9876543213",
    password: demoPasswordHash,
    role: "STATION_HOST"
  },
  {
    _id: "user-fleetoperator-001",
    name: "FleetOperator",
    email: "fleetoperator@example.com",
    phone: "9876543214",
    password: demoPasswordHash,
    role: "FLEET_OPERATOR"
  }
];

const vehicles = [
  {
    _id: "vehicle-001",
    userId: "user-evdriver-001",
    registrationNumber: "TN01AB1234",
    brand: "Tata",
    model: "Nexon EV",
    batteryCapacity: 40.5,
    currentBatteryPercentage: 42.0,
    connectorType: "CCS2",
    createdAt: now
  },
  {
    _id: "vehicle-002",
    userId: "user-evdriver-001",
    registrationNumber: "TN01CD5678",
    brand: "MG",
    model: "ZS EV",
    batteryCapacity: 50.3,
    currentBatteryPercentage: 68.0,
    connectorType: "CCS2",
    createdAt: now
  },
  {
    _id: "vehicle-003",
    userId: "user-evdriver-002",
    registrationNumber: "TN02EF1234",
    brand: "Hyundai",
    model: "Kona Electric",
    batteryCapacity: 39.2,
    currentBatteryPercentage: 55.0,
    connectorType: "CCS2",
    createdAt: now
  },
  {
    _id: "vehicle-004",
    userId: "user-fleetoperator-001",
    registrationNumber: "TN09FL2026",
    brand: "Mahindra",
    model: "XUV400 EV",
    batteryCapacity: 39.4,
    currentBatteryPercentage: 61.0,
    connectorType: "CCS2",
    createdAt: now
  }
];

const stations = [
  {
    _id: "station-001",
    name: "GreenCharge EV Station",
    address: "123 Anna Nagar Main Road, Chennai, Tamil Nadu, 600040",
    latitude: 13.085,
    longitude: 80.2101,
    status: "AVAILABLE",
    approvalStatus: "APPROVED",
    rejectionReason: null,
    ownerId: "user-stationhost-001"
  },
  {
    _id: "station-002",
    name: "Erode FastCharge Hub",
    address: "Perundurai Road, Erode, Tamil Nadu, 638011",
    latitude: 11.341,
    longitude: 77.7172,
    status: "AVAILABLE",
    approvalStatus: "APPROVED",
    rejectionReason: null,
    ownerId: "user-stationhost-002"
  }
];

const ports = [
  { _id: "port-001", stationId: "station-001", portNumber: 1, connectorType: "CCS2", powerKw: 60, status: "AVAILABLE", pricePerKwh: 12, approvalStatus: "APPROVED", rejectionReason: null },
  { _id: "port-002", stationId: "station-001", portNumber: 2, connectorType: "CCS2", powerKw: 120, status: "AVAILABLE", pricePerKwh: 15, approvalStatus: "APPROVED", rejectionReason: null },
  { _id: "port-003", stationId: "station-001", portNumber: 3, connectorType: "TYPE2", powerKw: 22, status: "AVAILABLE", pricePerKwh: 10, approvalStatus: "APPROVED", rejectionReason: null },
  { _id: "port-004", stationId: "station-002", portNumber: 1, connectorType: "CCS2", powerKw: 60, status: "AVAILABLE", pricePerKwh: 13, approvalStatus: "APPROVED", rejectionReason: null },
  { _id: "port-005", stationId: "station-002", portNumber: 2, connectorType: "CCS2", powerKw: 120, status: "AVAILABLE", pricePerKwh: 16, approvalStatus: "APPROVED", rejectionReason: null }
];

const bookings = [
  {
    _id: "booking-001",
    userId: "user-evdriver-001",
    vehicleId: "vehicle-001",
    stationId: "station-001",
    portId: "port-001",
    startTime: pastStart,
    endTime: pastEnd,
    status: "COMPLETED",
    createdAt: new Date("2026-09-07T12:00:00.000Z")
  },
  {
    _id: "booking-002",
    userId: "user-evdriver-001",
    vehicleId: "vehicle-002",
    stationId: "station-002",
    portId: "port-004",
    startTime: futureStart,
    endTime: futureEnd,
    status: "COMPLETED",
    createdAt: new Date("2026-09-10T12:00:00.000Z")
  },
  {
    _id: "booking-003",
    userId: "user-evdriver-002",
    vehicleId: "vehicle-003",
    stationId: "station-001",
    portId: "port-003",
    startTime: laterStart,
    endTime: laterEnd,
    status: "PENDING",
    createdAt: new Date("2026-09-11T08:00:00.000Z")
  },
  {
    _id: "booking-004",
    userId: "user-evdriver-002",
    vehicleId: "vehicle-003",
    stationId: "station-002",
    portId: "port-005",
    startTime: new Date("2026-09-18T10:00:00.000Z"),
    endTime: new Date("2026-09-18T11:00:00.000Z"),
    status: "CONFIRMED",
    createdAt: new Date("2026-09-11T08:30:00.000Z")
  }
];

const sessions = [
  {
    _id: "session-001",
    bookingId: "booking-001",
    userId: "user-evdriver-001",
    vehicleId: "vehicle-001",
    stationId: "station-001",
    portId: "port-001",
    actualStartTime: pastStart,
    actualEndTime: pastEnd,
    energyConsumedKwh: 35.5,
    cost: 426.0,
    status: "COMPLETED",
    createdAt: pastStart
  },
  {
    _id: "session-002",
    bookingId: "booking-002",
    userId: "user-evdriver-001",
    vehicleId: "vehicle-002",
    stationId: "station-002",
    portId: "port-004",
    actualStartTime: new Date("2026-09-10T06:30:00.000Z"),
    actualEndTime: new Date("2026-09-10T07:20:00.000Z"),
    energyConsumedKwh: 20.0,
    cost: 260.0,
    status: "COMPLETED",
    createdAt: new Date("2026-09-10T06:30:00.000Z")
  }
];

const payments = [
  {
    _id: "payment-001",
    userId: "user-evdriver-001",
    chargingSessionId: "session-001",
    amount: 426.0,
    status: "SUCCESS",
    paymentMethod: "UPI",
    transactionId: "TXN-DEMO-0001",
    paymentDate: new Date("2026-09-08T07:20:00.000Z")
  }
];

const resetCollections = [
  "payments",
  "charging_sessions",
  "bookings",
  "charging_ports",
  "charging_stations",
  "vehicles",
  "users"
];

resetCollections.forEach((collectionName) => db.getCollection(collectionName).deleteMany({}));
db.users.insertMany(users);
db.vehicles.insertMany(vehicles);
db.charging_stations.insertMany(stations);
db.charging_ports.insertMany(ports);
db.bookings.insertMany(bookings);
db.charging_sessions.insertMany(sessions);
db.payments.insertMany(payments);

const adminCount = db.admins.countDocuments({});
const preservedAdmin = db.admins.findOne({ email: "admin@evcharging.com" });

print("Demo data reset complete.");
print(`Preserved admins collection. Admin count: ${adminCount}`);
print(`Existing admin preserved: ${preservedAdmin ? "yes" : "no"}`);
printjson({
  users: db.users.countDocuments({}),
  vehicles: db.vehicles.countDocuments({}),
  charging_stations: db.charging_stations.countDocuments({}),
  charging_ports: db.charging_ports.countDocuments({}),
  bookings: db.bookings.countDocuments({}),
  charging_sessions: db.charging_sessions.countDocuments({}),
  payments: db.payments.countDocuments({})
});
