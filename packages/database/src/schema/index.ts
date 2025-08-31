export * from './auth';
export * from './trucks';
export * from './routes';
export * from './citizens';

import {relations} from 'drizzle-orm';
import {user, account, session} from './auth';
import {truck, truckLocation} from './trucks';
import {route, routeHistory, routeAssignment} from './routes';
import {citizenAddress, userEducationProgress} from './citizens';

export const userRelations = relations(user, ({many, one}) => ({
  accounts: many(account),
  sessions: many(session),
  createdRoutes: many(route, {relationName: 'createdBy'}),
  approvedRoutes: many(route, {relationName: 'approvedBy'}),
  routeHistory: many(routeHistory),
  assignments: many(routeAssignment, {relationName: 'driver'}),
  assignmentsMade: many(routeAssignment, {relationName: 'assignedBy'}),
  address: one(citizenAddress),
  educationProgress: many(userEducationProgress),
}));

export const routeRelations = relations(route, ({one, many}) => ({
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
  history: many(routeHistory),
  assignments: many(routeAssignment),
}));

export const truckRelations = relations(truck, ({many}) => ({
  locations: many(truckLocation),
  assignments: many(routeAssignment),
}));

export const routeAssignmentRelations = relations(routeAssignment, ({one}) => ({
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
