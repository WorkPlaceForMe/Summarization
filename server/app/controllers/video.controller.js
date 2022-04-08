require('dotenv').config({
  path: '../../config.env'
})
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const moment = require('moment')
const { getVideoDurationInSeconds } = require('get-video-duration')
const environment = require('../utils/environment')
const db = require('../models')

exports.processVideo = async (req, res) => {
  const format = 'HH:mm:ss'
  const defaultStartTime = '00:00:00'
  let difference = 0

  try {
    if (!fs.existsSync(environment.INPUT_VIDEO_FILE_PATH)) {
      return res.status(400).json({
        success: false,
        error_code: 1,
        message: 'Video file not found',
        inputFilePath: environment.INPUT_VIDEO_FILE_PATH
      })
    } else {
      const reqBody = req.body
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

      const duration = await getVideoDurationInSeconds(environment.INPUT_VIDEO_FILE_PATH)
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

      if(!reqBody.endTime){
        reqBody.endTime = moment.utc(moment.duration(duration, 'seconds').as('milliseconds')).format(this.format)
      }

      console.log('file found')
      res.status(200).send({
        success: true,
        message: 'Video is under process, it will be ready soon.'
      })
      
      let cmd = `sh demo.sh`

      if (reqBody.startTime) {
        cmd = cmd + ' -s ' + reqBody.startTime
      }

      if (reqBody.endTime) {
        cmd = cmd + ' -e ' + reqBody.endTime
      }
   
      if (reqBody.duration) {
        cmd = cmd + ' -d ' + Math.floor(reqBody.duration * 60)
      }

      console.log(cmd, '==================CMD===================')
      db.progress.create({
        progress_value: 1
      }).then(progress => {
        if (progress) {
          console.log('Progress data created ' + progress)
        }
      })

      exec(cmd,
        {
          cwd: `${environment.OUTPUT_PATH}`
        },
        (err, stdout, stderr) => {
          if (err) {
            console.log(`error:  ${err}`)
          } else {
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
          }

          db.progress.destroy({
            where: { progress_value: 1 }
          }).then(() => {
            console.log('Row deleted successfully from progress table')
          })
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
      apiUrl: `/api/videoChunk`
    }
    if (fs.existsSync(environment.OUTPUT_VIDEO_FILE_PATH)) {
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
    const videoSize = fs.statSync(environment.OUTPUT_VIDEO_FILE_PATH).size

    const range = req.headers.range

    if (!range) {
      res.writeHead(200, {
        'Content-Length': videoSize,
        'Content-Type': 'video/mp4'
      })

      fs.createReadStream(environment.OUTPUT_VIDEO_FILE_PATH).pipe(res)
    } else {   
      const chunkSize = 10 ** 6
      const start = Number(range.replace(/\D/g, ""))
      const end = Math.min(start + chunkSize, videoSize - 1)
      const contentLength = end - start + 1
      
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
      };

      console.log("********** Video headers ************* " + range)
      console.log("********** Start ************* " + start)
      console.log("********** End ************* " + end)
      console.log("********** chunkSize ************* " + chunkSize)

      res.writeHead(206, headers)
      const videoStream = fs.createReadStream(environment.OUTPUT_VIDEO_FILE_PATH, { start, end });
      videoStream.pipe(res)
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error
    })
  }
}

exports.getOutputVideo = async (req, res) => {
  try {
    const response = {
      success: true,
      outputUrl: ''
    }

    if (fs.existsSync(environment.OUTPUT_VIDEO_FILE_PATH)) {
      response.outputUrl = `${process.env.app_url}/assets/output/output.mp4`
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

exports.uploadVideo = async (req, res) => {
  try {
    const response = {
      success: true,
      output: false,
      message: 'Video Uploaded Successfully',
      apiUrl: `${process.env.app_url}/api/video`
    }

    const oldPath = `${req.file.destination}/${req.file.filename}`
    const is = fs.createReadStream(oldPath);
    const os = fs.createWriteStream(environment.INPUT_VIDEO_FILE_PATH);

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