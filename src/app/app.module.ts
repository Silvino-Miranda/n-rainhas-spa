import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QueensSolverModule } from './queens-solver/queens-solver.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    QueensSolverModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
