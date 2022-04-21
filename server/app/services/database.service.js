const db = require('../models')
const environment = require('../utils/environment')

exports.createProgressData = async (inputFilePath, outputFilePath, clientId) => {
  return db.progress.create({
    input_file_path: inputFilePath,
    output_file_path: outputFilePath,
    client_id: clientId,
    progress_value: environment.SUMMARIZATION_STATUS_IN_PROGRESS
  })
}

exports.updateProgressData = async (progressId, progressValue) => {
  return db.progress.update(
    { progress_value: progressValue },
    { where: { id: progressId } }
  )
}

exports.findProgressData = async (inputFilePath, clientId, progressValue) => {
  if (inputFilePath) {
    return db.progress.findOne({
      where: { input_file_path: inputFilePath, client_id: clientId, progress_value: progressValue },
      order: [['createdAt', 'DESC']]
    })
  } else {
    return db.progress.findOne({
      where: { client_id: clientId, progress_value: progressValue },
      order: [['createdAt', 'DESC']]
    })
  }
}

exports.findProgressDataList = async (inputFilePath, clientId) => {
  if (inputFilePath) {
    return db.progress.findAll({
      where: { input_file_path: inputFilePath, client_id: clientId },
      order: [['createdAt', 'DESC']]
    })
  } else {
    return db.progress.findAll({
      where: { client_id: clientId },
      order: [['createdAt', 'DESC']]
    })
  }
}
