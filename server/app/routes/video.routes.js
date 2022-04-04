const controller = require('../controllers/video.controller')
const environment = require('../utils/environment')
const multer = require('multer')
const upload = multer({dest: environment.OUTPUT_PATH})

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept')
    next()
  })

  app.get('/api/videos', controller.getVideos)
  app.post('/api/video/process', controller.processVideo)
  app.get('/api/video', controller.getOutputVideo)
  app.post('/api/video', upload.single('uploadVideo'), controller.uploadVideo)
  app.get('/api/video/check', controller.checkOutputFile)
  app.get('/api/videoChunk', controller.getOutputVideoStream)
}
