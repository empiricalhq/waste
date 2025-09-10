import { testDb } from './database';
import { user, truck, route, routeAssignment } from '@lima-garbage/database';
import type {
  User,
  NewUser,
  Truck,
  NewTruck,
  Route,
  NewRoute,
  RouteAssignment,
  NewRouteAssignment,
} from '@lima-garbage/database';

/**
 * Create a test user with the specified role
 */
export async function createTestUser(overrides: Partial<NewUser> = {}): Promise<User> {
  const defaultUser: NewUser = {
    id: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test User',
    email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
    appRole: 'citizen',
    role: 'user',
    emailVerified: true,
    isActive: true,
    ...overrides,
  };

  const [createdUser] = await testDb.insert(user).values(defaultUser).returning();
  console.log(`👤 Created test user: ${createdUser.name} (${createdUser.appRole})`);
  return createdUser;
}

/**
 * Create a test admin user
 */
export async function createTestAdmin(overrides: Partial<NewUser> = {}): Promise<User> {
  return createTestUser({
    name: 'Test Admin',
    appRole: 'admin',
    ...overrides,
  });
}

/**
 * Create a test driver user
 */
export async function createTestDriver(overrides: Partial<NewUser> = {}): Promise<User> {
  return createTestUser({
    name: 'Test Driver',
    appRole: 'driver',
    ...overrides,
  });
}

/**
 * Create a test citizen user
 */
export async function createTestCitizen(overrides: Partial<NewUser> = {}): Promise<User> {
  return createTestUser({
    name: 'Test Citizen',
    appRole: 'citizen',
    ...overrides,
  });
}

/**
 * Create a test truck
 */
export async function createTestTruck(overrides: Partial<NewTruck> = {}): Promise<Truck> {
  const defaultTruck: NewTruck = {
    id: `test-truck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    licensePlate: `TEST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    model: 'Test Truck Model',
    capacity: 1000,
    isActive: true,
    ...overrides,
  };

  const [createdTruck] = await testDb.insert(truck).values(defaultTruck).returning();
  console.log(`🚛 Created test truck: ${createdTruck.licensePlate}`);
  return createdTruck;
}

/**
 * Create a test route
 */
export async function createTestRoute(createdBy: string, overrides: Partial<NewRoute> = {}): Promise<Route> {
  const defaultRoute: NewRoute = {
    id: `test-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `Test Route ${Date.now()}`,
    description: 'A test route for automated testing',
    createdBy,
    status: 'draft',
    estimatedDuration: 120, // 2 hours
    ...overrides,
  };

  const [createdRoute] = await testDb.insert(route).values(defaultRoute).returning();
  console.log(`🗺️ Created test route: ${createdRoute.name}`);
  return createdRoute;
}

/**
 * Create a test route assignment
 */
export async function createTestAssignment(params: {
  routeId: string;
  truckId: string;
  driverId: string;
  assignedBy: string;
  overrides?: Partial<NewRouteAssignment>;
}): Promise<RouteAssignment> {
  const { routeId, truckId, driverId, assignedBy, overrides = {} } = params;

  const defaultAssignment: NewRouteAssignment = {
    id: `test-assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    routeId,
    truckId,
    driverId,
    assignedBy,
    status: 'assigned',
    scheduledStartTime: new Date(),
    ...overrides,
  };

  const [createdAssignment] = await testDb.insert(routeAssignment).values(defaultAssignment).returning();
  console.log(`📋 Created test assignment: ${createdAssignment.id}`);
  return createdAssignment;
}

/**
 * Create a complete test scenario with admin, driver, truck, route, and assignment
 */
export async function createTestScenario(): Promise<{
  admin: User;
  driver: User;
  citizen: User;
  truck: Truck;
  route: Route;
  assignment: RouteAssignment;
}> {
  console.log('🏗️ Creating complete test scenario...');

  const admin = await createTestAdmin();
  const driver = await createTestDriver();
  const citizen = await createTestCitizen();
  const truck = await createTestTruck();
  const route = await createTestRoute(admin.id);
  const assignment = await createTestAssignment({
    routeId: route.id,
    truckId: truck.id,
    driverId: driver.id,
    assignedBy: admin.id,
  });

  console.log('✅ Test scenario created successfully');

  return {
    admin,
    driver,
    citizen,
    truck,
    route,
    assignment,
  };
}
