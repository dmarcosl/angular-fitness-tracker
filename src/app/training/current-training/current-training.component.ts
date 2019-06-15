import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {StopTrainingComponent} from './stop-training.component';
import {TrainingService} from '../training.service';
import {Store} from '@ngrx/store';
import * as fromTraining from '../training.reducer';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.css']
})
export class CurrentTrainingComponent implements OnInit {

  public progress: number;
  private timer: number;

  constructor(private dialog: MatDialog,
              private trainingService: TrainingService,
              private store: Store<fromTraining.State>) {
  }

  ngOnInit() {
    this.progress = 0;
    this.startOrResumeTimer();
  }

  startOrResumeTimer(): void {
    this.store.select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe(ex => {
        const step = ex.duration / 100 * 1000;
        this.timer = setInterval(() => {
          this.progress += 1;
          if (this.progress >= 100) {
            this.trainingService.completeExercise();
            clearInterval(this.timer);
          }
        }, step);
      });
  }

  onStop(): void {
    clearInterval(this.timer);
    this.dialog.open(StopTrainingComponent, {
      data: {progress: this.progress}
    }).afterClosed().subscribe(
      result => {
        if (result) {
          this.trainingService.cancelExercise(this.progress);
        } else {
          this.startOrResumeTimer();
        }
      }
    );
  }

}
