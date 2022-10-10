import { Injectable, ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private angularPlugin = new AngularPlugin();
  private appInsights = new ApplicationInsights({
      config: {
          connectionString: environment.appInsights.connectionString,
          extensions: [this.angularPlugin],
          extensionConfig: {
              [this.angularPlugin.identifier]: {
                  router: this.router,
                  errorServices: [new ErrorHandler()],
              },
          },
          // send telemetry immediately
          //maxBatchSizeInBytes: 1,
          // log internal app insights errors to console
          //loggingLevelConsole: 2 
      },
  });

  constructor(private router: Router) {
    var telemetryInitializer = (envelope: any) => {
      envelope.tags["ai.cloud.role"] = "FrontEnd";
      // envelope.data.someField = 'This item passed through my telemetry initializer';
    }
    this.appInsights.addTelemetryInitializer(telemetryInitializer);

    this.appInsights.loadAppInsights();

    this.appInsights.context.application.ver = '1.0-dev';  
  }

  // expose methods that can be used in components and services
  trackEvent(name: string): void {
    this.appInsights.trackEvent({ name });
  }

  trackTrace(message: string): void {
      this.appInsights.trackTrace({ message });
  }
}
