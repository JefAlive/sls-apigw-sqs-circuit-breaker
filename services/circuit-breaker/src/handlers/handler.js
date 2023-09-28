'use strict'

import {
  EventBridgeClient,
  DisableRuleCommand,
  EnableRuleCommand,
} from '@aws-sdk/client-eventbridge'
import {
  LambdaClient,
  UpdateEventSourceMappingCommand,
} from '@aws-sdk/client-lambda'

const handler = async (event) => {
  const message = getLastMessage(event)

  handleCreateItemConsumerMessage(message)
  handleHealthCheckerMessage(message)

  return 'SUCCESS'
}

const getLastMessage = (event) => {
  const record = event.Records.pop()
  return record.Sns.Message
}

const handleCreateItemConsumerMessage = async (message) => {
  if (message.createItemConsumer === 'disable') {
    await toggleItemConsumerRunning(false)
  } else if (message.createItemConsumer === 'enable') {
    await toggleItemConsumerRunning(true)
  }
}

const toggleItemConsumerRunning = async (toggle) => {
  const lambdaClient = new LambdaClient({})
  await lambdaClient.send(
    new UpdateEventSourceMappingCommand({
      UUID: process.env.lambdaMappingId,
      Enabled: toggle,
    }),
  )
}

const handleHealthCheckerMessage = async (message) => {
  if (message.healthChecker === 'disable') {
    await disableEventBridge()
  } else if (message.healthChecker === 'enable') {
    await enableEventBridge()
  }
}

const disableEventBridge = async () => {
  const eventBridgeClient = new EventBridgeClient({
    region: process.env.awsRegion,
  })
  await eventBridgeClient.send(
    new DisableRuleCommand({
      Name: process.env.eventBridgeName,
    }),
  )
}

const enableEventBridge = async () => {
  const eventBridgeClient = new EventBridgeClient({
    region: process.env.awsRegion,
  })
  await eventBridgeClient.send(
    new EnableRuleCommand({
      Name: process.env.eventBridgeName,
    }),
  )
}

module.exports = { handler }
