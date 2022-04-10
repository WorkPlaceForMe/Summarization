#!/bin/bash

helpFunction()
{
   echo ""
   echo "Usage: $0 -i inputFileName -o outputFileName -s startTime -e endTime -d duration"
   echo -e "\t-i Input video file name"
   echo -e "\t-o Output video file name"
   echo -e "\t-s Video start time"
   echo -e "\t-e Video end time"
   echo -e "\t-d Summarized video duration"
   exit 1 # Exit script after printing help
}

while getopts "i:o:s:e:d:" opt
do
   case "$opt" in
      i ) inputFileName="$OPTARG" ;;
      o ) outputFileName="$OPTARG" ;;
      s ) startTime="$OPTARG" ;;
      e ) endTime="$OPTARG" ;;
      d ) duration="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

ffmpeg -ss $startTime -to $endTime -i $inputFileName -c copy input_trimmed.mp4
mv input_trimmed.mp4 input.mp4

python3 demo_video_summarization.py --input $inputFileName --out_filename $outputFileName --duration $duration --dont_show

ffmpeg -i $outputFileName -vcodec libx264 output_x264.mp4
mv output_x264.mp4 output.mp4