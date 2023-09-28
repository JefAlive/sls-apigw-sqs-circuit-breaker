'use strict'

const { PublishCommand, SNSClient } = require('@aws-sdk/client-sns')

const handler = async () => {
  const response = await fetch('https://www.boredapi.com/api/activity')
  const data = await response.json()
  console.log('item read from processing queue')
  console.log(data)

  if (!data.price) {
    await publishUnhealthy()
  }

  return 'SUCCESS'
}

const publishUnhealthy = async () => {
  const snsClient = new SNSClient({})
  return await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify({
        createItemConsumer: 'disable',
        healthChecker: 'enable',
      }),
      TopicArn: process.env.errorTopicArn,
    }),
  )
}

module.exports = { handler }
