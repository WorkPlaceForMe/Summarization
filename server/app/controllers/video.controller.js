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
      if (reqBody.endTime && reqBody.frames) {
        return res.status(400).json({
          success: false,
          message: 'Specify either End time or Frames'
        })
      }
      if (reqBody.frames && reqBody.frames < 5400) {
        return res.status(400).json({
          success: false,
          message: 'Frames value must be atleast 5400.'
        })
      }

      if (reqBody.frames && reqBody.startTime) {
        const endTime = moment(reqBody.startTime, format).add(reqBody.frames / 30, 'second')
        difference = endTime.diff(moment(reqBody.startTime, format))
      }

      if (reqBody.frames && !reqBody.endTime) {
        difference = (reqBody.frames / 30) * 1000
      }

      reqBody.startTime = reqBody.startTime ? reqBody.startTime : defaultStartTime

      if (reqBody.startTime && reqBody.endTime) {
        difference = moment(reqBody.endTime, format).diff(moment(reqBody.startTime, format))
        if (difference < 0) {
          return res.status(400).send({
            message: 'End time must be greater than start time'
          })
        }

        if (!reqBody.frames) {
          reqBody.frames = difference * 30 / 1000
        }
      }

      const duration = await getVideoDurationInSeconds(environment.INPUT_VIDEO_FILE_PATH)
      if (duration <= 180) {
        return res.status(400).json({
          success: false,
          message: 'Input video must be longer than 3 minutes'
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
          message: 'End time or frames size is greater than actual video duration'
        })
      }

      if (duration && !reqBody.frames) {
        reqBody.frames = duration * 30
      }

      console.log('file found')
      res.status(200).send({
        success: true,
        message: 'Video is under process, it will be ready soon.'
      })
      let cmd = `python3 ${environment.VIDEO_CONVERTER_PYTHON_SCRIPT} --input ${environment.INPUT_VIDEO_FILE_PATH} --out_filename ${environment.OUTPUT_VIDEO_FILE_PATH} --dont_show --timestamp ${reqBody.startTime}`
   
      if (reqBody.frames) {
        cmd = cmd + ' --duration ' + Math.floor(reqBody.frames / 30)
      }

      //Add ffmpege conversion command
      cmd = cmd + ' && ffmpeg -i output.mp4 -vcodec libx264 output_x264.mp4 -y && mv output_x264.mp4 output.mp4'

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