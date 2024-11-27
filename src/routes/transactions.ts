import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExist } from '../middlewares/check-session-id-exists'

// Cookies -> forma para manter contexto entre requisições


export async function transactionsRoutes(app: FastifyInstance) {

  app.get("/", {
    preHandler: [checkSessionIdExist]
  }, async (request) => {

    const { sessionId } = request.cookies
    const transactions = await knex("transactions")
      .select("*")
      .where("session_id", sessionId)

    //retornar como objeto para quando quiser retornar mais informações, retorna dentro do objeto sem alterar o valor e sem precisar alterar no front end
    return { transactions }
  })

  app.get("/:id", {
    preHandler: [checkSessionIdExist]
  }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid()
    })

    const {id} = getTransactionParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    // o .first é o metodo para retornar um único item(objeto) e não uma array
    const transaction = await knex("transactions")
      .where("id", id)
      .andWhere("session_id", sessionId)
      .first()

    
    return {
      transaction
    }
  })

  app.get("/summary", {
    preHandler: [checkSessionIdExist]
  }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex("transactions")
      .where("session_id", sessionId)
      .sum("amount", {as: "amount"})
      .first()

    return { summary }
  })

  app.post('/', async (request, reply) => {
    
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"])    
    })

    const {title, amount, type} = createTransactionBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }


    await knex("transactions")
      .insert({
        id: crypto.randomUUID(),
        title,
        session_id: sessionId,
        amount: type === "credit" ? amount : amount * -1
      })
  
    return reply.status(201).send()
  })
}