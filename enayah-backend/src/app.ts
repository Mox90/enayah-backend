import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import routes from './routes'

const app = express()

//app.use(helmet())
/*app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
)*/
//app.use(express.json())

app.use('/api/v1', routes)

//app.use(errorHandler)

export default app

function cors(): any {
  throw new Error('Function not implemented.')
}
