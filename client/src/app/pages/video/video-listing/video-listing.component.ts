import { Component, OnInit } from "@angular/core";
import { trigger, style, animate, transition } from "@angular/animations";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { VideoService } from "../../../services/video.service";

@Component({
  selector: "app-video-listing",
  templateUrl: "./video-listing.component.html",
  styleUrls: ["./video-listing.component.css"],
  animations: [
    trigger("flyInOut", [
      transition("void => *", [
        style({ transform: "translateX(100%)" }),
        animate(400),
      ]),
    ]),
  ],
})
export class VideoListingComponent implements OnInit {
  dialogRef: NbDialogRef<any>;
  videoUrl: string = "";
  videoExists: boolean = false;

  constructor(
    private dialogService: NbDialogService,
    private videoService: VideoService
  ) {}

  ngOnInit() {}

  // openVideoModal(template: any) {
  //   this.videoService.getOutputVideo().subscribe(
  //     (res: any) => {
  //       this.videoUrl = res.outputUrl;
  //       this.dialogRef = this.dialogService.open(template, {
  //         hasScroll: true,
  //         dialogClass: "model-full",
  //       });
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }

  openVideoModal(template: any) {
    this.videoService.checkOutputVideo().subscribe(
      (res: any) => {
        this.videoExists = res.output;
        this.videoUrl = res.apiUrl;
        this.dialogRef = this.dialogService.open(template, {
          hasScroll: true,
          dialogClass: "model-full",
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  playPause() {
    var myVideo: any = document.getElementById("play_video");
    if (myVideo.paused) {
      myVideo.play();
    } else {
      myVideo.pause();
    }
  }

  processVideo() {
    this.videoService.processVideo().subscribe(
      (res: any) => {
        console.log(res);
        alert(res.message);
      },
      (error) => {
        console.log(error);
        alert(error.error.message);
      }
    );
  }

  closeModal() {
    this.dialogRef.close();
  }
}
