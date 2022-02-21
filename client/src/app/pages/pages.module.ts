import { NgModule } from "@angular/core";
import {
  NbMenuModule,
  NbPopoverModule,
  NbTimepickerModule,
} from "@nebular/theme";
import { ThemeModule } from "../@theme/theme.module";
import { PagesComponent } from "./pages.component";
import { PagesRoutingModule } from "./pages-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { FacesService } from "../services/faces.service";
import { AnnotationsService } from "../services/annotations.service";
import { ColorsService } from "../services/colors";
import { StrService } from "../services/strArray";
import { TrustedUrlPipe } from "../pipes/trusted-url.pipe";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FileUploadModule } from "ng2-file-upload";
import { UrlPipe } from "../pipes/url.pipe";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime";
import { PagenotfoundComponent } from "./pagenotfound/pagenotfound.component";
import { TrustedStylePipe } from "../pipes/trusted-style.pipe";
import { FormsModule as ngFormsModule } from "@angular/forms";
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbTreeGridModule,
  NbAccordionModule,
  NbButtonModule,
  NbListModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbTabsetModule,
  NbUserModule,
  NbActionsModule,
  NbCheckboxModule,
  NbRadioModule,
  NbDatepickerModule,
  NbFormFieldModule,
  NbSelectModule,
  NbSpinnerModule,
  NbContextMenuModule,
} from "@nebular/theme";
import { A11yModule } from "@angular/cdk/a11y";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { PortalModule } from "@angular/cdk/portal";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { CdkTableModule } from "@angular/cdk/table";
import { CdkTreeModule } from "@angular/cdk/tree";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { authInterceptorProviders } from "../_helpers/auth.interceptor";
import { ChartModule } from "angular2-chartjs";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxEchartsModule } from "ngx-echarts";
import { GoogleLoginProvider, SocialLoginModule } from "angularx-social-login";
import { MsalModule } from "@azure/msal-angular";
import { PublicClientApplication } from "@azure/msal-browser";
import { VideoListingComponent } from "./video/video-listing/video-listing.component";

@NgModule({
  imports: [
    NgxEchartsModule,
    NgxChartsModule,
    ChartModule,
    Ng2SmartTableModule,
    NbSpinnerModule,
    NbContextMenuModule,
    NbActionsModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbTimepickerModule,
    NbSelectModule,
    ngFormsModule,
    NbAccordionModule,
    NbButtonModule,
    NbListModule,
    NbRouteTabsetModule,
    NbStepperModule,
    NbFormFieldModule,
    NbTabsetModule,
    NbUserModule,
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    A11yModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    PortalModule,
    ScrollingModule,
    NbPopoverModule,
    SocialLoginModule,
    MsalModule.forRoot(
      new PublicClientApplication({
        auth: {
          clientId: "e1486010-fe9f-499f-92c3-c813ea490cb8", // This is your client ID
          authority: "https://login.microsoftonline.com" + "/" + "common",
          redirectUri: "http://localhost:4200", // This is your redirect URI
        },
        cache: {
          cacheLocation: "localStorage",
        },
      }),
      null,
      null
    ),
  ],
  declarations: [
    PagesComponent,
    TrustedUrlPipe,
    UrlPipe,
    PagenotfoundComponent,
    TrustedStylePipe,
    VideoListingComponent,
  ],
  providers: [
    FacesService,
    DatePipe,
    ColorsService,
    StrService,
    AnnotationsService,
    authInterceptorProviders,
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: true, //keeps the user signed in
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "177947832755-0kqanmd36fjt3v3lbr7nqs1aghevs56e.apps.googleusercontent.com"
            ), // your client id
          },
        ],
      },
    },
  ],
})
export class PagesModule {}
