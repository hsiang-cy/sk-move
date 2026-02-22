import { createSchema } from 'graphql-yoga'
import { Kind } from 'graphql'
import { type Context } from './context'

function parseLiteral(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:  return ast.value
    case Kind.BOOLEAN: return ast.value
    case Kind.INT:     return parseInt(ast.value, 10)
    case Kind.FLOAT:   return parseFloat(ast.value)
    case Kind.NULL:    return null
    case Kind.LIST:    return ast.values.map(parseLiteral)
    case Kind.OBJECT:  return Object.fromEntries(
      ast.fields.map((f: any) => [f.name.value, parseLiteral(f.value)])
    )
    default:           return null
  }
}

const jsonScalarResolver = {
  JSON: { serialize: (v: any) => v, parseValue: (v: any) => v, parseLiteral }
}
import { accountResolvers } from './resolvers/account'
import { destinationResolvers } from './resolvers/destination'
import { vehicleResolvers } from './resolvers/vehicle'
import { orderResolvers } from './resolvers/order'
import { computeResolvers } from './resolvers/compute'

export type { Context }

const typeDefs = /* GraphQL */ `
  scalar JSON

  enum Status        { inactive active deleted }
  enum ComputeStatus { initial pending computing completed failed cancelled }
  enum AccountRole   { admin manager normal guest just_view }

  type Account {
    account_id:       ID!
    status:           Status!
    account_role:     AccountRole!
    account:          String!
    email:            String!
    company_name:     String
    company_industry: String
    people_name:      String!
    phone:            String
    point:            Int!
    created_at:       Float
    updated_at:       Float
    data:             JSON
    point_logs:       [PointLog!]!
  }

  type AuthPayload {
    token:   String!
    account: Account!
  }

  type PointLog {
    id:         ID!
    account_id: Int!
    change:     Int!
    reason:     String!
    data:       JSON
    created_at: Float
  }

  type Destination {
    id:                  ID!
    account_id:          Int!
    status:              Status!
    name:                String!
    address:             String!
    lat:                 String!
    lng:                 String!
    data:                JSON
    created_at:          Float
    updated_at:          Float
    comment_for_account: String
  }

  type CustomVehicleType {
    id:                  ID!
    account_id:          Int!
    status:              Status!
    name:                String!
    capacity:            Int!
    data:                JSON
    created_at:          Float
    updated_at:          Float
    comment_for_account: String
  }

  type Vehicle {
    id:                  ID!
    account_id:          Int!
    status:              Status!
    vehicle_number:      String!
    vehicle_type:        Int!
    depot_id:            Int
    data:                JSON
    created_at:          Float
    updated_at:          Float
    comment_for_account: String
    vehicleTypeInfo:     CustomVehicleType
    depot:               Destination
  }

  type Order {
    id:                   ID!
    account_id:           Int!
    status:               Status!
    data:                 JSON
    created_at:           Float
    updated_at:           Float
    destination_snapshot: JSON!
    vehicle_snapshot:     JSON!
    comment_for_account:  String
    computes:             [Compute!]!
  }

  type Compute {
    id:                  ID!
    account_id:          Int!
    order_id:            Int!
    status:              Status!
    compute_status:      ComputeStatus!
    start_time:          Float
    end_time:            Float
    fail_reason:         String
    data:                JSON
    created_at:          Float
    updated_at:          Float
    comment_for_account: String
    routes:              [Route!]!
  }

  type Route {
    id:             ID!
    compute_id:     Int!
    vehicle_id:     Int!
    status:         Status!
    total_distance: Int!
    total_time:     Int!
    total_load:     Int!
    created_at:     Float
    vehicle:        Vehicle
    stops:          [RouteStop!]!
  }

  type RouteStop {
    id:             ID!
    route_id:       Int!
    destination_id: Int!
    sequence:       Int!
    arrival_time:   Int!
    demand:         Int!
    created_at:     Float
    destination:    Destination
  }

  type Query {
    me: Account
    pointLogs: [PointLog!]!
    destinations(status: Status): [Destination!]!
    destination(id: ID!): Destination
    customVehicleTypes(status: Status): [CustomVehicleType!]!
    customVehicleType(id: ID!): CustomVehicleType
    vehicles(status: Status): [Vehicle!]!
    vehicle(id: ID!): Vehicle
    orders(status: Status): [Order!]!
    order(id: ID!): Order
    computes(orderId: ID, status: ComputeStatus): [Compute!]!
    compute(id: ID!): Compute
  }

  type Mutation {
    register(account: String!, email: String!, password: String!, people_name: String!): AuthPayload!
    login(account: String!, password: String!): AuthPayload!
    createDestination(name: String!, address: String!, lat: String!, lng: String!, data: JSON, comment_for_account: String): Destination!
    updateDestination(id: ID!, name: String, address: String, lat: String, lng: String, data: JSON, comment_for_account: String): Destination!
    deleteDestination(id: ID!): Destination!
    createCustomVehicleType(name: String!, capacity: Int!, data: JSON, comment_for_account: String): CustomVehicleType!
    updateCustomVehicleType(id: ID!, name: String, capacity: Int, data: JSON, comment_for_account: String): CustomVehicleType!
    deleteCustomVehicleType(id: ID!): CustomVehicleType!
    createVehicle(vehicle_number: String!, vehicle_type: ID!, depot_id: ID, data: JSON, comment_for_account: String): Vehicle!
    updateVehicle(id: ID!, vehicle_number: String, vehicle_type: ID, depot_id: ID, data: JSON, comment_for_account: String): Vehicle!
    deleteVehicle(id: ID!): Vehicle!
    createOrder(destination_snapshot: JSON!, vehicle_snapshot: JSON!, data: JSON, comment_for_account: String): Order!
    deleteOrder(id: ID!): Order!
    createCompute(order_id: ID!, data: JSON, comment_for_account: String): Compute!
    cancelCompute(id: ID!): Compute!
  }
`

function mergeResolvers(...maps: any[]) {
  const merged: any = {}
  for (const map of maps) {
    for (const [type, resolvers] of Object.entries(map)) {
      merged[type] ??= {}
      Object.assign(merged[type], resolvers)
    }
  }
  return merged
}

export const schema = createSchema<Context>({
  typeDefs,
  resolvers: mergeResolvers(
    jsonScalarResolver,
    accountResolvers,
    destinationResolvers,
    vehicleResolvers,
    orderResolvers,
    computeResolvers
  )
})
