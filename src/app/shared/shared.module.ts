import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';

const sharedModules =  [
  CommonModule,
  FormsModule,
  MaterialModule,
  FlexLayoutModule,
];

@NgModule({
  imports: [sharedModules],
  exports: [sharedModules]
})
export class SharedModule {
}
