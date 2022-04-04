import { Component, OnInit } from "@angular/core";
import { trigger, style, animate, transition } from "@angular/animations";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { VideoService } from "../../../services/video.service";
import * as moment from "moment";
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
const timeFormat = "HH:mm:ss";

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
  processForm: FormGroup;
  uploadForm: FormGroup;
  dialogRef: NbDialogRef<any>;
  videoUrl: string = "";
  videoExists: boolean = false;
  
  constructor(
    private dialogService: NbDialogService,
    private videoService: VideoService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {}

  formInitialization() {
    this.processForm = this.fb.group({
      startTime: [""],
      endTime: [""],
      frames: [null, [Validators.min(5400)]],
    }, { validators: [this.checkStartTimeAndEndTime, this.checkEndTimeAndFrame] });

    this.uploadForm = this.fb.group({
      uploadVideo: [null, Validators.required]
    });
  }

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

  openModal(template: any) {
    this.formInitialization();
    this.dialogRef = this.dialogService.open(template, {
      hasScroll: true,
      dialogClass: "model-full",
      closeOnBackdropClick: false,
    });
  }

  playPause() {
    var myVideo: any = document.getElementById("play_video");
    if (myVideo.paused) {
      myVideo.play();
    } else {
      myVideo.pause();
    }
  }

  clearStartOrEnd(type: string) {
    (<HTMLInputElement>document.getElementById(type)).value = "";
    if (type === "startTime") {
      this.processForm.patchValue({ startTime: "" });
    } else {
      this.processForm.patchValue({ endTime: "" });
    }
  }

  onProcessVideoSubmit() {
    const data = {
      startTime: this.processForm.value.startTime
        ? moment(this.processForm.value.startTime).format(timeFormat)
        : "",
      endTime: this.processForm.value.endTime
        ? moment(this.processForm.value.endTime).format(timeFormat)
        : "",
      frames: this.processForm.value.frames,
    };

    this.videoService.processVideo(data).subscribe(
      (res: any) => {
        this.closeModal();
        alert(res.message);
      },
      (error) => {
        console.log(error);
        alert(error.error.message);
      }
    );
  }

  onUploadVideoSubmit() {
    const formData = new FormData();
    formData.append('uploadVideo', this.uploadForm.get('uploadVideo').value);

     this.videoService.uploadVideo(formData).subscribe(
      (res: any) => {
        this.closeModal();
        alert(res.message);
      },
      (error) => {
        console.log(error);
        alert(error.error.message);
      }
    );
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('uploadVideo').setValue(file);
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  checkStartTimeAndEndTime(control: AbstractControl): ValidationErrors | null { 
    const startTime = control.get("startTime").value;
    const endTime = control.get("endTime").value;

    if (startTime && endTime) {
      const difference = moment(startTime, timeFormat).diff(moment(endTime, timeFormat))
      if (difference > 0) {
        return { 'invalidStartTimeEndTime': true }
      }
    }
 
    return null
  }

  checkEndTimeAndFrame(control: AbstractControl): ValidationErrors | null { 
    const endTime = control.get("endTime").value;
    const frames = control.get("frames").value;
  
    if (endTime && frames) { 
      return { 'invalidEndTimeFrame': true } 
    }
 
    return null
  }
}
