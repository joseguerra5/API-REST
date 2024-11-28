import { it, beforeAll, afterAll, describe, expect, beforeEach } from "vitest"
import {execSync} from "node:child_process"
import {app} from "../src/app"
import request from "supertest"
import { title } from "process"

describe("transactions routes", () => {
  beforeAll(async () => {
    await app.ready()
  })
  
  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all")
    execSync("npm run knex migrate:latest")
  })
  
  it("Should be able create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "Ner Transaction",
        amount: 1000,
        type: "credit",
      })
      .expect(201)
  })

  it("should be able list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "New Transaction",
      amount: 1000,
      type: "credit",
    })
    
    const cookies = createTransactionResponse.get("Set-Cookie")

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200)

      expect(listTransactionsResponse.body.transactions).toEqual(([
        expect.objectContaining({
          title: "New Transaction",
          amount: 1000,
        })
      ]))
  })

  it("should be able get specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "New Transaction",
      amount: 1000,
      type: "credit",
    })
    
    const cookies = createTransactionResponse.get("Set-Cookie")

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200)

      const transactionId = listTransactionsResponse.body.transactions[0].id

      const getTransactioResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200)

      expect(getTransactioResponse.body.transaction).toEqual((
        expect.objectContaining({
          title: "New Transaction",
          amount: 1000,
        })
      ))
  })

  it("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
    .post("/transactions")
    .send({
      title: "Credit Transaction",
      amount: 1000,
      type: "credit",
    })
    
    const cookies = createTransactionResponse.get("Set-Cookie")

    await request(app.server)
    .post("/transactions")
    .set("Cookie", cookies)
    .send({
      title: "Debit Transaction",
      amount: 500,
      type: "debit",
    })

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200)

      expect(summaryResponse.body.summary).toEqual({
        amount: 500
      })
  })

})