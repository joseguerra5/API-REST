// eslint-disable-next-line
import { knex } from 'knex'

//forma para declarar as tabelas pelo knex

declare module "knex/types/tables" {
  export interface Tables {
    transactions: {
      id: string
      amount: number
      title: string
      created_at: string
      session_id: string
    }
  }
}