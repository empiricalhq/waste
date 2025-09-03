import { db } from '../src/client';
import { truck, route, routeWaypoint, routeSchedule, user, routeAssignment, account } from '../src/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  await db.insert(user).values([
    {
      id: 'admin-1',
      email: 'admin@lima.gob.pe',
      name: 'Admin municipal',
      username: 'admin.municipal',
      displayUsername: 'Admin Municipal',
      role: 'admin',
      emailVerified: true,
    },
    {
      id: 'driver-1',
      email: 'driver1@lima.gob.pe',
      name: 'Juan Pérez',
      username: 'juan.perez',
      displayUsername: 'Juan Pérez',
      role: 'driver',
      phoneNumber: '+51-999-123-456',
    },
    {
      id: 'driver-2',
      email: 'driver2@lima.gob.pe',
      name: 'María González',
      username: 'maria.gonzalez',
      displayUsername: 'María González',
      role: 'driver',
      phoneNumber: '+51-999-789-012',
    },
    {
      id: 'admin-2',
      email: 'pedro.rojas.f24@gmail.com',
      name: 'Pedro Rojas',
      username: 'pedrorojasf',
      displayUsername: 'Pedro Rojas',
      role: 'admin',
      emailVerified: true,
    },
  ]);

  await db.insert(account).values([
    {
      id: 'admin-2',
      accountId: 'testadmin-credentials',
      providerId: 'credential',
      userId: 'admin-2',
      password:
        '0afb753ecbcb1e9943d70e2a9de3efa9:313c15541de6148319f12d972624a54e3eb23a862b9f5961324633352218e0cc5446b22c60f1fca7114e29ba915e12de537a4644528025962f5d59ab856a31ac',
      scope: 'all',
    },
  ]);

  await db.insert(truck).values([
    { id: 'truck-1', name: 'Lima Centro', licensePlate: 'ABC-123' },
    { id: 'truck-2', name: 'Lima Norte', licensePlate: 'XYZ-789' },
    { id: 'truck-3', name: 'San Isidro', licensePlate: 'SID-456' },
  ]);

  await db.insert(route).values([
    {
      id: 'route-1',
      name: 'Centro Histórico - turno mañana',
      description: 'Recorrido matutino por el centro histórico de Lima',
      startLat: -12.046374,
      startLng: -77.042793,
      estimatedDurationMinutes: 180,
      createdBy: 'admin-1',
      approvedBy: 'admin-1',
      approvedAt: new Date(),
    },
  ]);

  await db.insert(routeWaypoint).values([
    {
      id: 'wp-1',
      routeId: 'route-1',
      sequenceOrder: 1,
      lat: -12.046374,
      lng: -77.042793,
      streetName: 'Plaza de Armas',
      estimatedArrivalOffsetMinutes: 0,
    },
    {
      id: 'wp-2',
      routeId: 'route-1',
      sequenceOrder: 2,
      lat: -12.043333,
      lng: -77.028611,
      streetName: 'Jr. de la Unión',
      estimatedArrivalOffsetMinutes: 30,
    },
    {
      id: 'wp-3',
      routeId: 'route-1',
      sequenceOrder: 3,
      lat: -12.05,
      lng: -77.04,
      streetName: 'Av. Abancay',
      estimatedArrivalOffsetMinutes: 60,
    },
  ]);

  await db.insert(routeSchedule).values([
    { routeId: 'route-1', dayOfWeek: 1, startTime: '06:00' },
    { routeId: 'route-1', dayOfWeek: 2, startTime: '06:00' },
    { routeId: 'route-1', dayOfWeek: 3, startTime: '06:00' },
    { routeId: 'route-1', dayOfWeek: 4, startTime: '06:00' },
    { routeId: 'route-1', dayOfWeek: 5, startTime: '06:00' },
  ]);

  const today = new Date().toISOString().split('T')[0]!;

  await db.insert(routeAssignment).values([
    {
      id: 'assignment-1',
      routeId: 'route-1',
      truckId: 'truck-1',
      driverId: 'driver-1',
      assignedDate: today,
      scheduledStartTime: new Date(`${today}T06:00:00Z`),
      scheduledEndTime: new Date(`${today}T09:00:00Z`),
      status: 'scheduled',
      assignedBy: 'admin-1',
    },
    {
      id: 'assignment-2',
      routeId: 'route-1',
      truckId: 'truck-2',
      driverId: 'driver-1',
      assignedDate: today,
      scheduledStartTime: new Date(`${today}T14:00:00Z`),
      scheduledEndTime: new Date(`${today}T17:00:00Z`),
      status: 'scheduled',
      assignedBy: 'admin-1',
    },
    {
      id: 'assignment-3',
      routeId: 'route-1',
      truckId: 'truck-1', // same truck as morning,  but a different driver
      driverId: 'driver-2',
      assignedDate: today,
      scheduledStartTime: new Date(`${today}T10:00:00Z`),
      scheduledEndTime: new Date(`${today}T13:00:00Z`),
      status: 'scheduled',
      assignedBy: 'admin-1',
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('Check your database for:');
  console.log('- 3 users (1 admin, 2 drivers)');
  console.log('- 1 account linked to driver-1');
  console.log('- 3 trucks');
  console.log('- 1 route with waypoints and schedule');
  console.log('- 3 assignments showing shared drivers/trucks');

  process.exit(0);
}

seed().catch(error => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
