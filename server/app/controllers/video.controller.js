require('dotenv').config({
  path: '../../config.env'
})
const fs = require('fs')
const { exec } = require('child_process')
const moment = require('moment')
const { getVideoDurationInSeconds } = require('get-video-duration')
const environment = require('../utils/environment')
const databaseService = require('../services/database.service')
const path = require('path')

exports.processVideo = async (req, res) => {
  let inputVideoFile = process.env.VIDEO_PATH + environment.DEFAULT_VIDEO_FILE_NAME
  const format = 'HH:mm:ss'
  const reqBody = req.body
  const defaultStartTime = '00:00:00'
  let difference = 0

  if (reqBody.inputFileName && reqBody.inputFileName.includes('\\')) {
    reqBody.inputFileName = reqBody.inputFileName.split('\\').join(path.posix.sep)
  }

  if (reqBody.inputFileName && reqBody.inputFileName.trim() !== '') {
    inputVideoFile = reqBody.inputFileName
  }

  try {
    if (!fs.existsSync(inputVideoFile)) {
      return res.status(400).json({
        success: false,
        error_code: 1,
        message: 'Video file not found',
        inputFilePath: inputVideoFile
      })
    } else {
      if (reqBody.duration && reqBody.duration < 3) {
        return res.status(400).json({
          success: false,
          message: 'Duration value must be atleast 3 minutes'
        })
      }

      reqBody.startTime = reqBody.startTime ? reqBody.startTime : defaultStartTime

      if (reqBody.startTime && reqBody.endTime) {
        difference = moment(reqBody.endTime, format).diff(moment(reqBody.startTime, format))
        if (difference <= 0) {
          return res.status(400).send({
            message: 'End time must be greater than start time'
          })
        }
      }

      const duration = await getVideoDurationInSeconds(inputVideoFile)
      if (duration <= 180) {
        return res.status(400).json({
          success: false,
          message: 'Input video must be longer than 3 minutes'
        })
      }

      if (duration < Math.floor(reqBody.duration * 60)) {
        return res.status(400).json({
          success: false,
          message: 'Duration specified is greater than actual video length'
        })
      }

      const diffWithDefaultStartTime = moment(reqBody.startTime, format).diff(moment(defaultStartTime, format))

      if (duration < diffWithDefaultStartTime / 1000) {
        return res.status(400).json({
          success: false,
          message: 'Start time is greater than actual video duration'
        })
      }

      if (duration < difference / 1000) {
        return res.status(400).json({
          success: false,
          message: 'End time greater than actual video duration'
        })
      }

      if (!reqBody.duration) {
        reqBody.duration = 3
      }

      if (!reqBody.endTime) {
        reqBody.endTime = moment.utc(moment.duration(duration, 'seconds').as('milliseconds')).format(format)
      }

      res.status(200).send({
        success: true,
        message: 'Video is under process, it will be ready soon.'
      })

      const outputVideoFileExtension = inputVideoFile.split('.').pop()
      const outputVideoFile = inputVideoFile.substring(0, inputVideoFile.lastIndexOf('.')) +
              environment.OUTPUT_VIDEO_FILE_NAME_SUFFIX + '.' + outputVideoFileExtension

      let cmd = `sh demo.sh -i ${inputVideoFile} -o ${outputVideoFile}`

      if (reqBody.startTime) {
        cmd = cmd + ' -s ' + reqBody.startTime
      }

      if (reqBody.endTime) {
        cmd = cmd + ' -e ' + reqBody.endTime
      }

      if (reqBody.duration) {
        cmd = cmd + ' -d ' + Math.floor(reqBody.duration * 60)
      }

      if (!reqBody.clientId) {
        reqBody.clientId = environment.DEFAULT_CLIENT_ID
      }

      console.log(`Client with clientId: ${reqBody.clientId} submitted this command for processing.... ${cmd}`)

      databaseService.createProgressData(inputVideoFile, outputVideoFile, reqBody.clientId).then(progress => {
        if (progress) {
          console.log('Progress data created with id: ' + progress.id)

          exec(cmd,
            {
              cwd: `${environment.VIDEO_CONVERTER_PYTHON_SCRIPT_HOME_PATH}`
            },
            (err, stdout, stderr) => {
              if (err) {
                databaseService
                  .updateProgressData(progress.id, -1)
                  .then(() => console.log('Row updated for error'))
                console.log('======= Video Processing failed =======')
                console.log(`error: ${err}`)
              } else {
                console.log('======= Video Processing succeeded =======')
                databaseService
                  .updateProgressData(progress.id, 1)
                  .then(() => console.log('Row updated for success'))
                console.log(`stdout: ${stdout}`)
                console.log(`stderr: ${stderr}`)
              }
            })
        }
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.checkOutputFile = async (req, res) => {
  try {
    const response = {
      success: true,
      output: false,
      apiUrl: '/api/videoChunk'
    }

    console.log('Client id: ' + req.body.clientId)
    if (!req.body.clientId) {
      req.body.clientId = environment.DEFAULT_CLIENT_ID
    }
    databaseService.findProgressData(req.body.inputFileName, req.body.clientId, 1).then(data => {
      if (data) {
        if (fs.existsSync(data.output_file_path)) {
          response.output = true
        }
      } else {
        response.output = false
      }
      res.status(200).send(response)
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.getOutputVideoStream = async (req, res) => {
  try {
    if (!req.query.clientId) {
      req.query.clientId = environment.DEFAULT_CLIENT_ID
    }

    if (req.query.inputFileName && req.query.inputFileName.includes('\\')) {
      req.query.inputFileName = req.query.inputFileName.split('\\').join(path.posix.sep)
    }

    databaseService.findProgressData(req.query.inputFileName, req.query.clientId, 1).then(data => {
      if (data) {
        if (fs.existsSync(data.output_file_path)) {
          console.log(
            'Processed video found for the client with client id: ' +
              req.query.clientId +
              ' video path: ' +
              data.output_file_path
          )
          const videoSize = fs.statSync(data.output_file_path).size

          const range = req.headers.range

          if (!range) {
            res.writeHead(200, {
              'Content-Length': videoSize,
              'Content-Type': 'video/mp4'
            })

            fs.createReadStream(data.output_file_path).pipe(res)
          } else {
            const chunkSize = 10 ** 6
            const start = Number(range.replace(/\D/g, ''))
            const end = Math.min(start + chunkSize, videoSize - 1)
            const contentLength = end - start + 1

            const headers = {
              'Content-Range': `bytes ${start}-${end}/${videoSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': contentLength,
              'Content-Type': 'video/mp4'
            }

            res.writeHead(206, headers)
            console.log('Output video file : ' + data.output_file_path)
            const videoStream = fs.createReadStream(data.output_file_path, { start, end })
            videoStream.pipe(res)
          }
        }
      } else {
        console.log('Processed video not found for the client with client id: ' + req.query.clientId)
        res.status(500).json({
          success: false,
          message: 'Processed video not found for the client with client id: ' + req.query.clientId
        })
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.uploadVideo = async (req, res) => {
  try {
    const response = {
      success: true,
      output: false,
      message: 'Video Uploaded Successfully',
      apiUrl: `${process.env.app_url}/api/video`
    }

    const oldPath = `${req.file.destination}/${req.file.filename}`
    const is = fs.createReadStream(oldPath)
    const os = fs.createWriteStream(process.env.VIDEO_PATH + environment.DEFAULT_VIDEO_FILE_NAME)

    is.pipe(os)
    is.on('end', () => {
      fs.unlinkSync(oldPath)
    })

    res.status(200).send(response)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.getVideoList = async (req, res) => {
  try {
    if (!req.query.clientId) {
      req.query.clientId = environment.DEFAULT_CLIENT_ID
    }

    if (req.query.inputFileName && req.query.inputFileName.includes('\\')) {
      req.query.inputFileName = req.query.inputFileName.split('\\').join(path.posix.sep)
    }

    databaseService.findProgressDataList(req.query.inputFileName, req.query.clientId).then(data => {
      if (data) {
        res.status(200).json({
          success: true,
          message: `Video list found for the client with client id: ${req.query.clientId}`,
          data: data
        })
      } else {
        res.status(500).json({
          success: false,
          message: `Video list not found for the client with client id: ${req.query.clientId}`
        })
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Video list not found for the client with client id: ${req.query.clientId}`
    })
  }
}
