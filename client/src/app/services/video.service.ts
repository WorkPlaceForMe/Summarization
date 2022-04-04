import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { api } from "../models/API";

@Injectable({
  providedIn: "root",
})
export class VideoService {
  API_URI = api;
  constructor(private http: HttpClient) {}

  getVideos() {
    return this.http.get(`${this.API_URI}/videos`);
  }

  processVideo(data: any) {
    return this.http.post(`${this.API_URI}/video/process`, data);
  }

  getOutputVideo() {
    return this.http.get(`${this.API_URI}/video`);
  }

  checkOutputVideo() {
    return this.http.get(`${this.API_URI}/video/check`);
  }

  uploadVideo(data: any) {
    return this.http.post(`${this.API_URI}/video`, data);
  }
}
