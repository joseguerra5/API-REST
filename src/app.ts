import fastify from 'fastify'
import cookie from "@fastify/cookie"
import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)

// todas as rotas que cairem nesse plugin ja vai ter o prefixo transaction pré definido
app.register(transactionsRoutes, {
  prefix: "transactions"
})