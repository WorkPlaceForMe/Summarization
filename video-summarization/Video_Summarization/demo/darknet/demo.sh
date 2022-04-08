#!/bin/bash

helpFunction()
{
   echo ""
   echo "Usage: $0 -s startTime -e endTime -d duration"
   echo -e "\t-s Video start time"
   echo -e "\t-e Video end time"
   echo -e "\t-d Summarized video duration"
   exit 1 # Exit script after printing help
}

while getopts "s:e:d:" opt
do
   case "$opt" in
      s ) startTime="$OPTARG" ;;
      e ) endTime="$OPTARG" ;;
      d ) duration="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

ffmpeg -ss $startTime -to $endTime -i input.mp4 -c copy input_trimmed.mp4
mv input_trimmed.mp4 input.mp4

python3 demo_video_summarization.py --input input.mp4 --dont_show --duration $duration

ffmpeg -i output.mp4 -vcodec libx264 output_x264.mp4
mv output_x264.mp4 output.mp4