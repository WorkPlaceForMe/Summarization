import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class VideoService {
  constructor(private http: HttpClient) {}

  getVideos() {
    return this.http.get(`/api/videos`);
  }

  processVideo(data: any) {
    return this.http.post(`/api/video/process`, data);
  }

  getOutputVideo() {
    return this.http.get(`/api/video`);
  }

  checkOutputVideo() {
    return this.http.get(`/api/video/check`);
  }

  uploadVideo(data: any) {
    return this.http.post(`/api/video`, data);
  }
}
