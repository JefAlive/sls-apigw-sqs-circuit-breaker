const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK',
    }),
  }
}

module.exports = {
  handler,
}
