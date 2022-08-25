require('dotenv').config()
const { until, By, Key } = require('selenium-webdriver')

const selenium = require('../lib/selenium')
const hash = require('../lib/hash')

describe('selenium chrome', () => {
  let driver

  before(async () => {
    driver = await selenium.init(process.env.SERVER, process.env.PROXY, 'normal', true)
  })

  after(async () => {
    await driver.sleep(3000)
    await driver.quit()
  })

  it('find elements', async () => {
    await driver.get('https://www.binance.com/zh-CN/support/announcement')

    const d = await driver.wait(until.elementLocated(By.css('.css-13lbccr')), 10 * 1000, 'not found')
    if (!d) {
      return
    }
    console.log(`page loaded`)

    const dis = await d.findElements(By.css('div'))
    console.log('annouces - ', dis.length)

    const cts = []
    for (const di of dis) {
      ct = {}

      ct.content = ''
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

      cts.push(ct)
    }

    console.log(cts)
  })
})
