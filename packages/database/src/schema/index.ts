import { relations } from 'drizzle-orm';

export * from './auth';
export * from './trucks';
export * from './routes';
export * from './citizens';

import { user, account, session } from './auth';
import { truck, truckCurrentLocation, truckLocationHistory } from './trucks';
import { route, routeWaypoint, routeSchedule, routeAssignment } from './routes';
import { citizenProfile, userEducationProgress } from './citizens';

export const userRelations = relations(user, ({ many, one }) => ({
  accounts: many(account),
  sessions: many(session),
  profile: one(citizenProfile),
  educationProgress: many(userEducationProgress),
  // route management
  createdRoutes: many(route, { relationName: 'createdBy' }),
  approvedRoutes: many(route, { relationName: 'approvedBy' }),
  // assignments
  driverAssignments: many(routeAssignment, { relationName: 'driver' }),
  assignmentsMade: many(routeAssignment, { relationName: 'assignedBy' }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const truckRelations = relations(truck, ({ one, many }) => ({
  currentLocation: one(truckCurrentLocation),
  locationHistory: many(truckLocationHistory),
  assignments: many(routeAssignment),
}));

export const truckCurrentLocationRelations = relations(truckCurrentLocation, ({ one }) => ({
  truck: one(truck, {
    fields: [truckCurrentLocation.truckId],
    references: [truck.id],
  }),
  assignment: one(routeAssignment, {
    fields: [truckCurrentLocation.routeAssignmentId],
    references: [routeAssignment.id],
  }),
}));

export const routeRelations = relations(route, ({ one, many }) => ({
  creator: one(user, {
    fields: [route.createdBy],
    references: [user.id],
    relationName: 'createdBy',
  }),
  approver: one(user, {
    fields: [route.approvedBy],
    references: [user.id],
    relationName: 'approvedBy',
  }),
  waypoints: many(routeWaypoint),
  schedules: many(routeSchedule),
  assignments: many(routeAssignment),
}));

export const routeWaypointRelations = relations(routeWaypoint, ({ one }) => ({
  route: one(route, {
    fields: [routeWaypoint.routeId],
    references: [route.id],
  }),
}));

export const routeScheduleRelations = relations(routeSchedule, ({ one }) => ({
  route: one(route, {
    fields: [routeSchedule.routeId],
    references: [route.id],
  }),
}));

export const routeAssignmentRelations = relations(routeAssignment, ({ one }) => ({
  route: one(route, {
    fields: [routeAssignment.routeId],
    references: [route.id],
  }),
  truck: one(truck, {
    fields: [routeAssignment.truckId],
    references: [truck.id],
  }),
  driver: one(user, {
    fields: [routeAssignment.driverId],
    references: [user.id],
    relationName: 'driver',
  }),
  assignedBy: one(user, {
    fields: [routeAssignment.assignedBy],
    references: [user.id],
    relationName: 'assignedBy',
  }),
}));

export const citizenProfileRelations = relations(citizenProfile, ({ one }) => ({
  user: one(user, {
    fields: [citizenProfile.userId],
    references: [user.id],
  }),
}));

export const userEducationProgressRelations = relations(userEducationProgress, ({ one }) => ({
  user: one(user, {
    fields: [userEducationProgress.userId],
    references: [user.id],
  }),
}));
