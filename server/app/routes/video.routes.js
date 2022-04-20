const controller = require('../controllers/video.controller')
const environment = require('../utils/environment')
const multer = require('multer')
const upload = multer({dest: environment.OUTPUT_PATH})

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept')
    next()
  })

  app.post('/api/video/process', controller.processVideo)
  app.post('/api/video', upload.single('uploadVideo'), controller.uploadVideo)
  app.post('/api/video/check', controller.checkOutputFile)
  app.get('/api/video/videoChunk', controller.getOutputVideoStream)
  app.get('/api/video/list', controller.getVideoList)
}
