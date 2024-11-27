import fastify from 'fastify'
import cookie from "@fastify/cookie"
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)

// todas as rotas que cairem nesse plugin ja vai ter o prefixo transaction pré definido
app.register(transactionsRoutes, {
  prefix: "transactions"
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
