require('dotenv').config()
const db = require('./db')
const service = require('./service/binanceService')

const main = async () => {
  await db.connect()

  const fn = () => {
    console.log(`looping ${new Date()} ---------`)
    service
      .action()
      .then(() => console.log('looping end ---------'))
      .catch((e) => console.error(`looping end error - ${new Date()} - ${e}`))
    return fn
  }
  setInterval(fn(), process.env.LOOP_WAIT)
}

main().catch(console.error)
