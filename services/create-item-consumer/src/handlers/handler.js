'use strict'

import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

const handler = async () => {
  const response = await fetch('https://www.boredapi.com/api/activity')
  const data = response.json()

  if (!data.price) {
    await publishUnhealthy()
  }

  return 'SUCCESS'
}

const publishUnhealthy = async () => {
  const snsClient = new SNSClient({})
  return await snsClient.send(
    new PublishCommand({
      Message: {
        createItemConsumer: 'disable',
        healthChecker: 'enable',
      },
      TopicArn: process.env.errorTopicArn,
    }),
  )
}

module.exports = { handler }
