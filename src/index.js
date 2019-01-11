import fs from 'fs'
import https from 'https'
import express from 'express'
import bodyParser from 'body-parser'

import { ServiceNow } from './service-now'

const ACTIONS = {
  TaskClosed: 'TaskClosed',
  TaskCreated: 'TaskCreated',
  TaskRemoved: 'TaskRemoved'
}

const start async (port = 8443) => {
  const serviceNow = new ServiceNow('development.service-now.com', 'serviceNowUsername', 'serviceNowUserPassword')

  const app = express()
    .post('/process', bodyParser.json(), async (req, res) => {
      try {
        const { action = '' } = req.body
        console.log(`PROCESSING ${action} WEBHOOK`)

        if (action === 'TaskCreated') {
          const { appUrl, taskName } = req.body

          await serviceNow.createIncident({
            category: 'complyify',
            short_description: `[COMPLYIFY] ${taskName} Task`,
            description: JSON.stringify({ appUrl, source: 'webhook', timestamp: new Date() })
          })
        } else if (action.toUpperCase() === 'TaskClosed') {
          const { taskName } = req.body
          const { result = [] } = await serviceNow.findIncidents({ category: 'complyify' })

          const foundIncident = result.find(({ short_description }) => short_description.includes(taskName))
          if (!foundIncident) {
            console.log(`MISSING INCIDENT FOR TASK ${taskName}`)
            return res.sendStatus(200)
          }

          await serviceNow.updateIncident(foundIncident.sys_id, {
            state: 'Resolved',
            close_code: 'Closed/Resolved By Caller',
            resolved_at: new Date().toISOString(),
            close_notes: JSON.stringify({ reason: 'TASK CLOSED ON SYSTEM', source: 'webhook', timestamp: new Date() })
          })
        } else if (action.toUpperCase() === 'TaskRemoved') {
          const { taskName, reason } = req.body
          const { result = [] } = await serviceNow.findIncidents({ category: 'complyify' })

          const foundIncident = result.find(({ short_description }) => short_description.includes(taskName))
          if (!foundIncident) {
            console.log(`MISSING INCIDENT FOR TASK ${taskName}`)
            return res.sendStatus(200)
          }

          await serviceNow.updateIncident(foundIncident.sys_id, {
            state: 'Resolved',
            close_code: 'Closed/Resolved By Caller',
            resolved_at: new Date().toISOString(),
            close_notes: JSON.stringify({ reason, source: 'webhook', timestamp: new Date() })
          })
        } else {
          throw new Error('INVALID ACTION')
        }

        return res.sendStatus(200)
      } catch (error) {
        console.log(error, 'WEBHOOK_ERROR')
        return res.sendStatus(500)
      }
    })
    .use((req, res) => res.sendStatus(404))

  https.createServer({
    key: fs.readFileSync('./key.pem', 'ascii'),
    cert: fs.readFileSync('./cert.pem', 'ascii')
  }, app).listen(port, () => console.log('RUNNING WEBHOOK EXAMPLE'))
}

start()