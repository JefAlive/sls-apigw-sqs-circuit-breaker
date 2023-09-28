'use strict'

import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

const handler = async () => {
  const response = await fetch('https://www.boredapi.com/api/activity')
  const data = response.json()

  if (data.price > 0) {
    await publishHealthy()
  }

  return 'SUCCESS'
}

const publishHealthy = async () => {
  const snsClient = new SNSClient({})
  return await snsClient.send(
    new PublishCommand({
      Message: {
        createItemConsumer: 'enable',
        healthChecker: 'disable',
      },
      TopicArn: process.env['EXTERNALAPIHEALTHYTOPIC-ARN'],
    }),
  )
}

module.exports = { handler }
