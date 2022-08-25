const db = require('./index')
const { timeNow } = require('../lib')

const coll = 'announcement'

/*
announcement - {
  _id: xxx,
  exchange: binance,
  state: 0,
  content: '',
  contentHash: '',
  publishTime: '',
  updateTime: '',
}
*/

const find = async (fitler, options) => {
  return await db.find(coll, fitler, options)
}

const count = async (filter) => {
  return await db.countDocuments(coll, filter)
}

const exist = async (exchange, contentHash) => {
  return await db.findOne(coll, { exchange, contentHash })
}

const update = async (cts) => {
  const opers = []
  cts.forEach((i) => {
    i.updateTime = timeNow()
    const o = {
      updateOne: {
        filter: { exchange: i.exchange, state: i.state, contentHash: i.contentHash },
        update: { $set: i },
        upsert: true,
      },
    }
    opers.push(o)
  })
  if (opers.length === 0) {
    return false
  }

  return await db.bulkWrite(coll, opers)
}

module.exports = {
  find,
  count,
  exist,
  update,
}
