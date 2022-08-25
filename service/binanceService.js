require('dotenv').config()
const { until, By, Key } = require('selenium-webdriver')

const selenium = require('../lib/selenium')
const emailSend = require('../lib/emailSend')
const hash = require('../lib/hash')
const dbAnnouncement = require('../db/dbAnnouncement')

const URL = 'https://www.binance.com/zh-CN/support/announcement'
const LENGHT_TRIM = 500
const DEBUG = process.env.DEBUG

const init = async () => {
  const driver = await selenium.init(process.env.SERVER, process.env.PROXY, 'normal', eval(process.env.HEADLESS))
  return driver
}

const close = async (driver) => {
  if (!driver) {
    return
  }
  // await driver.sleep(3000)
  await driver.quit()
}

const crawl = async () => {
  console.log(`crawl - ${new Date()}`)

  const driver = await init()

  const contents = []
  try {
    await driver.get(URL)

    const d = await driver.wait(until.elementLocated(By.css('.css-13lbccr')), 10 * 1000, 'not found')
    if (!d) {
      return
    }
    console.log(`page loaded`)

    const dis = await d.findElements(By.css('div'))
    console.log('annouces - ', dis.length)

    for (const di of dis) {
      ct = { exchange: 'binance', state: 0 }

      ct.content = ''
      ct.contentHash = ''
      const di0 = await di.findElement(By.css('a'))
      if (di0) {
        ct.content = await di0.getText()
        ct.contentHash = hash.digest(ct.content)
      }

      ct.publishTime = ''
      const di1 = await di.findElement(By.css('span'))
      if (di1) {
        ct.publishTime = await di1.getText()
      }

      contents.push(ct)
    }
  } catch (e) {
    console.error(e)
  } finally {
    await close(driver)
  }

  DEBUG && console.log('-------------')
  DEBUG && console.log(contents)

  return contents
}

const action = async () => {
  const notice = { name: 'binance announce', msg: '' }
  const contents = await crawl()
  if (!contents?.length) {
    return
  }

  for (let i = 0; i < contents.length; ++i) {
    const ct = contents[i]
    const exist = await dbAnnouncement.exist(ct.exchange, ct.contentHash)
    if (exist) {
      continue
    }
    notice.msg += `${ct.publishTime} - ${ct.content.substring(0, LENGHT_TRIM)} || `
  }
  if (!notice.msg) {
    console.log(`action not news`)
    return
  }
  await dbAnnouncement.update(contents)

  DEBUG && console.log(`send - ${notice.name} - ${notice.msg}`)
  await emailSend.send(notice.name, notice.msg)
}

module.exports = {
  init,
  close,
  crawl,
  action,
}
