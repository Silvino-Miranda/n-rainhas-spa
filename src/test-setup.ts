import '@analogjs/vitest-angular/setup-zone';

import { provideZonelessChangeDetection } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
    teardown: { destroyAfterEach: true }
  }
);

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()]
  });
});
