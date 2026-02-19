import { Hono } from 'hono'
import type { BlankEnv } from 'hono/types'
import { sql } from 'drizzle-orm'
import { errorControl } from '#middleware'


// import { openApiDoc, stoplight } from './openapi.ts'
import { Scalar } from '@scalar/hono-api-reference'



// 測試資料庫連線
// try {
//     await drizzleORM.execute(sql`SELECT 1`)
//     console.log('資料庫連線成功')
// } catch (e) {
//     console.error('資料庫連線失敗：\n', e)
//     process.exit(1)
// }

// const app: BlankEnv = new Hono()
const app = new Hono()
    .get('/test', (c) => c.text('test succesful'))


    // .get('/doc', (c) => c.json(openApiDoc))
    .get('/scalar', Scalar({ url: '/doc', theme: 'purple' }))
    // .get('/stoplight', (c) => { return c.html(stoplight); })

export default app

console.log('http://localhost:3000/scalar')
console.log('http://localhost:3000/stoplight')
