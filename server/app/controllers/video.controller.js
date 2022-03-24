require('dotenv').config({
  path: '../../config.env'
})
const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')
const moment = require('moment')
const {getVideoDurationInSeconds} = require('get-video-duration')
const environment = require('../utils/environment')

exports.processVideo = async (req, res) => {
  try {
    if (!fs.existsSync(inputFilePath)) {
      return res.status(400).json({
        success: false,
        error_code: 1,
        message: 'Video file not found',
        inputFilePath
      })
    } else {
      const reqBody = req.body
      if ((reqBody.startTime && !reqBody.endTime) || (!reqBody.startTime && reqBody.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Start time & End time both is required.'
        })
      }
      if (reqBody.frames && reqBody.frames < 5400) {
        return res.status(400).json({
          success: false,
          message: 'Frames value must be atleast 5400.'
        })
      }
      if (reqBody.startTime && reqBody.endTime) {
        const format = 'HH:mm:ss'
        const difference = moment(reqBody.startTime, format).diff(moment(reqBody.endTime, format))
        if (difference > 0) {
          return res.status(400).send({
            message: 'End time must be greater than start time'
          })
        }
      }

      const duration = await getVideoDurationInSeconds(inputFilePath)
      if (duration <= 180) {
        return res.status(400).json({
          success: false,
          message: 'Input video must be longer than 3 minutes'
        })
      }

      console.log('file found')
      res.status(200).send({
        success: true,
        message: 'Video is under process, it will ready soon.'
      })
      let cmd = `bash ${environment.VIDEO_CONVERTER_BASH_SCRIPT}`
      if (reqBody.startTime && reqBody.endTime) {
        cmd = cmd + ' ' + reqBody.startTime + ' ' + reqBody.endTime
      }
      if (reqBody.frames) {
        cmd = cmd + ' ' + reqBody.frames
      }

      console.log(cmd, '==================CMD===================')

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.log(err)
        } else {
          console.log(`output: ${stdout}`)
          console.log(`error: ${stderr}`)
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
      apiUrl: `${process.env.app_url}/api/videoChunk`
    }
    if (fs.existsSync(environment.OUTPUT_VIDEO_FILE)) {
      response.output = true
    }
    res.status(200).send(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.getOutputVideoStream = async (req, res) => {
  try {
    const stat = fs.statSync(environment.OUTPUT_VIDEO_FILE)
    const fileSize = stat.size

    const requestRangeHeader = req.headers.range

    if (!requestRangeHeader) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/webm'
      })

      fs.createReadStream(environment.OUTPUT_VIDEO_FILE).pipe(res)
    } else {
      const {start, end, chunkSize} = getChunkProps(requestRangeHeader, fileSize)

      const readStream = fs.createReadStream(environment.OUTPUT_VIDEO_FILE, {start, end})

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/webm'
      })
      readStream.pipe(res)
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

const getChunkProps = (range, fileSize) => {
  const parts = range.replace(/bytes=/, '').split('-')

  const start = parseInt(parts[0], 10)
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
  const chunkSize = end - start + 1

  return {
    start,
    end,
    chunkSize
  }
}

exports.getOutputVideo = async (req, res) => {
  try {
   const response = {
      success: true,
      outputUrl: ''
    }

    if (fs.existsSync(environment.OUTPUT_VIDEO_FILE)) {
      response['outputUrl'] = `${process.env.app_url}/assets/output/output.mp4`
    }
    res.status(200).send(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.getVideos = async (req, res) => {
  try {
    const videoPath = path.resolve(__dirname, '../../resources/videos')
    const openVideoPath = `${process.env.app_url}/api/pictures/videos`
    if (!fs.existsSync(videoPath)) {
      res.status(200).send({
        success: true,
        data: []
      })
    } else {
      const responseData = []
      const videoFiles = fs.readdirSync(videoPath)
      for (const videoFile of videoFiles) {
        const url = `${openVideoPath}/${videoFile}`
        responseData.push({url})
      }
      res.status(200).send({
        success: true,
        data: responseData
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}
