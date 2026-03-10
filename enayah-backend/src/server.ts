import app from './app'
import { env } from './config/env'

app.set('trust proxy', 1)
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})
