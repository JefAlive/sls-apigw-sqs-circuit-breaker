'use strict'

const {
  EventBridgeClient,
  DisableRuleCommand,
  EnableRuleCommand,
} = require('@aws-sdk/client-eventbridge')
const {
  LambdaClient,
  UpdateEventSourceMappingCommand,
  GetEventSourceMappingCommand,
} = require('@aws-sdk/client-lambda')

const handler = async (event) => {
  const message = getLastMessage(event)

  await handleHealthCheckerMessage(message)
  await handleCreateItemConsumerMessage(message)

  return 'SUCCESS'
}

const getLastMessage = (event) => {
  const message = JSON.parse(event.Records[0].Sns.Message)
  console.log('circuit breaker received sns message')
  console.log(message)
  return message
}

const handleCreateItemConsumerMessage = async (message) => {
  if (message.createItemConsumer === 'disable') {
    await toggleItemConsumerRunning(false)
    console.log('disabled item consumer')
  } else if (message.createItemConsumer === 'enable') {
    await toggleItemConsumerRunning(true)
    console.log('enabled item consumer')
  }
}

const toggleItemConsumerRunning = async (toggle) => {
  const lambdaClient = new LambdaClient({})
  try {
    const response = await lambdaClient.send(
      new UpdateEventSourceMappingCommand({
        UUID: process.env.lambdaMappingId,
        Enabled: toggle,
      }),
    )
    console.log(response)
  } catch (err) {
    console.error(err)
  }

  const state = await getEventSourceMappingState(lambdaClient)
  if (state === 'Enabled' || state === 'Disabled') {
    return
  }

  await delay(5000)
  await toggleItemConsumerRunning(toggle)
}

const getEventSourceMappingState = async (lambdaClient) => {
  const response = await lambdaClient.send(
    new GetEventSourceMappingCommand({
      UUID: process.env.lambdaMappingId,
    }),
  )
  return response.State
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
      EventBusName: 'default',
    }),
  )
  console.log('disabled event bridge')
}

const enableEventBridge = async () => {
  const eventBridgeClient = new EventBridgeClient({
    region: process.env.awsRegion,
  })
  await eventBridgeClient.send(
    new EnableRuleCommand({
      Name: process.env.eventBridgeName,
      EventBusName: 'default',
    }),
  )
  console.log('enabled event bridge')
}

const delay = async (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

module.exports = { handler }
