import axios from 'axios'
import cheerio from 'cheerio'
import Connection from 'sequelize-connect'
import qs from 'qs'
import logger from './logger'
import { addTaskToQueue, createQueue } from './queue'

const discover = [__dirname + '/db/models']

new Connection(
  'scrapccpDB',
  null,
  null,
  {
    dialect: 'sqlite',
    storage: './scrapccp.sqlite',
    operatorsAliases: false,
  },
  discover,
  null,
  logger,
).then(db => {
  const Member = db.models.member
  const getMemberInfo = async ci => {
    try {
      const url = 'https://api.cerro.com.py/pagos/'
      const options = {
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({ nro_documento: ci, action: 'next' }),
      }
      const res = await axios(url, options)
      if (res.status === 200) {
        const $ = cheerio.load(res.data)
        const v = $('input[type="hidden"][name="view"]').val()
        const rgx = /socio.*info/gi
        if (v.match(rgx)) {
          const doc_no = ci
          const rawInfo = $('div.ccp-form-title')
            .children('h2')
            .text()
          const list = $('li.list-group-item')
          const [rawcpp_id, name] = rawInfo.split('-').map(t => t.trim())
          const cpp_id = rawcpp_id.match(/\d+/gi)[0]
          const category = list
            .children('div')
            .first()
            .text()
          const state = list
            .next()
            .children('div')
            .first()
            .text()
          const debt = list
            .next()
            .next()
            .children('div')
            .first()
            .text()
          const pic = list
            .children('span.float-right')
            .children('a')
            .children('img')
            .prop('src')
          await Member.upsert({
            cpp_id,
            doc_no,
            name,
            category,
            state,
            debt,
            pic,
          })
        }
      }
      logger.info(`CI[${ci}] - DONE!`)
    } catch (error) {
      logger.error(error.toString())
    }
  }

  const escrap = async () => {
    const qty = process.argv[2] || 9000000
    const offset = process.argv[3] || 1
    const ci = [...Array(qty).keys()].map(k => k + offset)
    const scrapQueue = createQueue(async (_, cbFunc) => {
      cbFunc()
    })
    ci.map(ci =>
      addTaskToQueue(scrapQueue, { name: ci, func: getMemberInfo(ci) }),
    )
  }

  escrap()
})
