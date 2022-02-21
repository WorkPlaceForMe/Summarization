import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { PagesComponent } from "./pages.component";
import { PagenotfoundComponent } from "./pagenotfound/pagenotfound.component";
import { VideoListingComponent } from "./video/video-listing/video-listing.component";

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "video-listing",
        component: VideoListingComponent,
      },
      { path: "", redirectTo: "video-listing", pathMatch: "full" },
      {
        path: "**",
        component: PagenotfoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
