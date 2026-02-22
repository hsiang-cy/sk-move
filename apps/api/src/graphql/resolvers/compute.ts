import { and, asc, eq } from 'drizzle-orm'
import {
  compute as computeTable,
  route as routeTable,
  route_stop as routeStopTable,
  vehicle as vehicleTable,
  destination as destinationTable
} from '../../db/schema'
import { requireAuth, type Context } from '../context'

export const computeResolvers = {
  Query: {
    computes: async (_: any, args: { orderId?: string; status?: string }, { db, user }: Context) => {
      requireAuth(user)
      const conditions: any[] = [eq(computeTable.account_id, user!.account_id)]
      if (args.orderId) conditions.push(eq(computeTable.order_id, parseInt(args.orderId)))
      if (args.status) conditions.push(eq(computeTable.compute_status, args.status as any))
      return db.select().from(computeTable).where(and(...conditions))
    },
    compute: async (_: any, args: { id: string }, { db, user }: Context) => {
      requireAuth(user)
      const [found] = await db
        .select()
        .from(computeTable)
        .where(and(
          eq(computeTable.id, parseInt(args.id)),
          eq(computeTable.account_id, user!.account_id)
        ))
        .limit(1)
      return found ?? null
    }
  },
  Mutation: {
    createCompute: async (
      _: any,
      args: { order_id: string; data?: any; comment_for_account?: string },
      { db, user }: Context
    ) => {
      requireAuth(user, 'normal')
      const [created] = await db.insert(computeTable).values({
        account_id: user!.account_id,
        order_id: parseInt(args.order_id),
        data: args.data,
        comment_for_account: args.comment_for_account,
      }).returning()
      return created
    },
    cancelCompute: async (_: any, args: { id: string }, { db, user }: Context) => {
      requireAuth(user, 'normal')
      const [updated] = await db
        .update(computeTable)
        .set({ compute_status: 'cancelled', updated_at: Math.floor(Date.now() / 1000) })
        .where(and(
          eq(computeTable.id, parseInt(args.id)),
          eq(computeTable.account_id, user!.account_id)
        ))
        .returning()
      if (!updated) throw new Error('Compute not found')
      return updated
    }
  },
  Compute: {
    routes: (parent: { id: number }, _: any, { db }: Context) =>
      db.select().from(routeTable).where(eq(routeTable.compute_id, parent.id))
  },
  Route: {
    vehicle: (parent: { vehicle_id: number }, _: any, { db }: Context) =>
      db.select().from(vehicleTable).where(eq(vehicleTable.id, parent.vehicle_id)).limit(1)
        .then(r => r[0] ?? null),
    stops: (parent: { id: number }, _: any, { db }: Context) =>
      db.select().from(routeStopTable)
        .where(eq(routeStopTable.route_id, parent.id))
        .orderBy(asc(routeStopTable.sequence))
  },
  RouteStop: {
    destination: (parent: { destination_id: number }, _: any, { db }: Context) =>
      db.select().from(destinationTable).where(eq(destinationTable.id, parent.destination_id)).limit(1)
        .then(r => r[0] ?? null)
  }
}
