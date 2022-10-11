import { ErrorHandler, NgModule } from '@angular/core';
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js';
import { MonitoringService } from './services/monitoring.service';

@NgModule({
  providers: [
    MonitoringService,
    {
      provide: ErrorHandler,
      useClass: ApplicationinsightsAngularpluginErrorService,
    },
  ],
})
export class MonitoringModule {
    constructor(private monitoring: MonitoringService) {}
}