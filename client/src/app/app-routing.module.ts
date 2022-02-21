import { ExtraOptions, RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

export const routes: Routes = [
  {
    path: "summarization",
    loadChildren: () =>
      import("./pages/pages.module").then((m) => m.PagesModule),
  },

  { path: "", redirectTo: "summarization/video-listing", pathMatch: "full" },
  { path: "**", redirectTo: "summarization/video-listing" },
];

const config: ExtraOptions = {
  useHash: false,
  relativeLinkResolution: "legacy",
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
