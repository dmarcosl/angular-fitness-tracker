import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material';
import {StopTrainingComponent} from './stop-training.component';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.css']
})
export class CurrentTrainingComponent implements OnInit {

  public progress: number;
  private timer: number;
  @Output() trainingExit = new EventEmitter<any>();

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    this.progress = 0;
    this.initTimer();
  }

  initTimer(): void {
    this.timer = setInterval(() => {
      this.progress += 1;
      if (this.progress >= 100) {
        clearInterval(this.timer);
      }
    }, 200);
  }

  onStop(): void {
    clearInterval(this.timer);
    this.dialog.open(StopTrainingComponent, {
      data: {progress: this.progress}
    }).afterClosed().subscribe(
      result => {
        if (result) {
          this.trainingExit.emit();
        } else {
          this.initTimer();
        }
      }
    );
  }

}
