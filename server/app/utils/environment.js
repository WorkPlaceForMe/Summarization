/**
 *
 * This file contains environment specific configuation
 */

module.exports = {
  OUTPUT_PATH: '/home/Video_Summarization/demo/darknet/',
  VIDEO_CONVERTER_PYTHON_SCRIPT_HOME_PATH: '/home/Video_Summarization/demo/darknet/',
  OUTPUT_VIDEO_FILE_NAME_SUFFIX: '-processed',
  VIDEO_CONVERTER_PYTHON_SCRIPT: '/home/Video_Summarization/demo/darknet/demo_video_summarization.py',
  DEFAULT_VIDEO_FILE_NAME: 'input.mp4',
  DEFAULT_CLIENT_ID: 'SummarizationUI',
  SUMMARIZATION_STATUS_NOT_STARTED: -1,
  SUMMARIZATION_STATUS_IN_PROGRESS: 0,
  SUMMARIZATION_STATUS_COMPLETED: 1,
  SUMMARIZATION_STATUS_ERROR: 2
}
