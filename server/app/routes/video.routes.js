const controller = require('../controllers/video.controller')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept')
    next()
  })

  app.get('/api/videos', controller.getVideos)
  app.get('/api/video/process', controller.processVideo)
  app.get('/api/video', controller.getOutputVideo)
  // app.get('/api/videoFile', controller.sendVideoFile)
  app.get('/api/video/check', controller.checkOutputFile)
  app.get('/api/videoChunk', controller.getOutputVideoStream)
}
