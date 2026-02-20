import { Hono } from 'hono'
import { createYoga } from 'graphql-yoga'
import { createDb } from './db/connect'
import { schema, Context } from './graphql/schema'
import { verify } from 'hono/jwt'

type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono API!')
})

app.get('/version', (c) => {
  return c.text('0.1.0')
})

// GraphQL Yoga Handler
const yoga = createYoga<{ request: Request; env: Bindings }, Context>({
  schema,
  context: async ({ request, env }) => {
    // 獲取 Database instance (Drizzle)
    const database = createDb(env.DATABASE_URL)
    
    // 從 Header 嘗試獲取 User
    let currentUser = null
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        currentUser = await verify(token, env.JWT_SECRET, 'HS256')
      } catch (e) {
        // Token invalid, keep currentUser null
      }
    }

    return {
      db: database,
      user: currentUser,
      env: env
    }
  }
})

// 將 Yoga 掛載到 /graphql
app.all('/graphql', (c) => yoga.fetch(c.req.raw, { env: c.env }))

export default app
