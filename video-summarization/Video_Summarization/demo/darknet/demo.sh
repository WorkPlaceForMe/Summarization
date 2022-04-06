rm output_x264.mp4
rm output.mp4

python3 demo_video_summarization.py --input ../input.mp4 --dont_show
#python3 video_codec_testing.py
#python3 database.py

ffmpeg -i output.mp4 -vcodec libx264 output_x264.mp4
cp output_x264.mp4 output.mp4
