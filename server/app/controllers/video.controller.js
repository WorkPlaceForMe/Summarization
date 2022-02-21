require('dotenv').config({
  path: '../../config.env'
})
const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')

exports.processVideo = async (req, res) => {
  try {
    const inputFilePath = '/home/Video_Summarization/demo/input.mp4'

    if (!fs.existsSync(inputFilePath)) {
      return res.status(400).json({
        success: false,
        error_code: 1,
        message: 'Video file not found',
        inputFilePath
      })
    } else {
      console.log('file found')
      res.status(200).send({
        success: true,
        message: 'Video is under process, it will ready soon.'
      })
      const cmd = 'bash /home/Video_Summarization/demo/darknet/demo.sh'

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
    // const outputFilePath = path.resolve(__dirname, '../../resources/videos/b.mp4') // FOR TESTING
    const outputFilePath = '/home/Video_Summarization/demo/darknet/output.mp4'
    const response = {
      success: true,
      output: false,
      apiUrl: `${process.env.app_url}/api/videoChunk`
    }
    if (fs.existsSync(outputFilePath)) {
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
    // const resolvedPath = path.resolve(__dirname, '../../resources/videos/b.mp4') // FOR TESTING
    const resolvedPath = '/home/Video_Summarization/demo/darknet/output.mp4'
    const stat = fs.statSync(resolvedPath)
    const fileSize = stat.size

    const requestRangeHeader = req.headers.range

    if (!requestRangeHeader) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/webm'
      })

      fs.createReadStream(resolvedPath).pipe(res)
    } else {
      const {start, end, chunkSize} = getChunkProps(requestRangeHeader, fileSize)

      const readStream = fs.createReadStream(resolvedPath, {start, end})

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
    const outputFilePath = '/home/Video_Summarization/demo/darknet/output.mp4'
    const response = {
      success: true,
      outputUrl: ''
    }

    if (fs.existsSync(outputFilePath)) {
      response['outputUrl'] = `${process.env.app_url}/assets/output/output.mp4`
    }
    // response['outputUrl'] = `${process.env.app_url}/assets/output/input.mp4` // FOR TESTING
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

// exports.getOutputVideoStream1 = async (req, res) => {
//   try {
//     const resolvedPath = path.resolve(__dirname, '../../resources/videos/output_YT.mp4') // FOR TESTING
//     //  const resolvedPath = '/home/Video_Summarization/demo/darknet/output.mp4'
//     const stat = fs.statSync(resolvedPath)
//     const fileSize = stat.size

//     const requestRangeHeader = req.headers.range

//     if (!requestRangeHeader) {
//       res.writeHead(200, {
//         'Content-Length': fileSize,
//         'Content-Type': 'video/webm'
//       })
//       console.log(requestRangeHeader, '===================IFF=======================')
//       fs.createReadStream(resolvedPath).pipe(res)
//     } else {
//       const {start, end, chunkSize} = getChunkProps(requestRangeHeader, fileSize)

//       const readStream = fs.createReadStream(resolvedPath, {start, end})
//       ///////////////////////////////////////////////////
//       let range = req.headers.range ? req.headers.range.replace(/bytes=/, '').split('-') : []
//       console.log(range)

//       range[0] = range[0] ? parseInt(range[0], 10) : 0
//       range[1] = range[1] ? parseInt(range[1], 10) : range[0] + chunkSize
//       if (range[1] > stat.size - 1) {
//         range[1] = stat.size - 1
//       }
//       range = {start: range[0], end: range[1]}

//       res.writeHead(206, {
//         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//         'Accept-Ranges': 'bytes',
//         'Content-Length': 20570982,
//         'Content-Type': 'video/webm',
//         'Cache-Control':
//           'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
//         Pragma: 'no-cache'
//       })
//       console.log(
//         requestRangeHeader,
//         '==================ELSE=======================',
//         range.end - range.start + 1
//       )
//       readStream.pipe(res)
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error
//     })
//   }
// }
