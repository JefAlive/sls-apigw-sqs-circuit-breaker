import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const handler = async (event) => {
  await pushToProcessingQueue(event.body)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Item pushed to processing queue',
    }),
  }
}

const pushToProcessingQueue = async (message) => {
  const client = new SQSClient({})
  await client.send(
    new SendMessageCommand({
      QueueUrl: process.env.queueUrl,
      MessageBody: message,
    }),
  )
}

module.exports = { handler }
