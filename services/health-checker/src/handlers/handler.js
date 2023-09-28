'use strict'

const { PublishCommand, SNSClient } = require('@aws-sdk/client-sns')

const handler = async () => {
  console.log('health checking...')
  const response = await fetch('https://www.boredapi.com/api/activity')
  const data = await response.json()
  console.log(data)

  if (data.price > 0) {
    await publishHealthy()
    console.log('publish healthy')
  }

  return 'SUCCESS'
}

const publishHealthy = async () => {
  const snsClient = new SNSClient({})
  return await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify({
        createItemConsumer: 'enable',
        healthChecker: 'disable',
      }),
      TopicArn: process.env.healthyTopicArn,
    }),
  )
}

module.exports = { handler }
