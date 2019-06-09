import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {StopTrainingComponent} from './stop-training.component';
import {TrainingService} from '../training.service';
import {Exercise} from '../exercise.model';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.css']
})
export class CurrentTrainingComponent implements OnInit {

  public progress: number;
  private timer: number;
  exercise: Exercise;

  constructor(private dialog: MatDialog, private trainingService: TrainingService) {
  }

  ngOnInit() {
    this.progress = 0;
    this.exercise = this.trainingService.getRunningExercises();
    this.initTimer();
  }

  initTimer(): void {
    const step = (this.exercise.duration / 100) * 1000;
    this.timer = setInterval(() => {
      this.progress += 1;
      if (this.progress >= 100) {
        this.trainingService.completeExercise();
        clearInterval(this.timer);
      }
    }, step);
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
          this.initTimer();
        }
      }
    );
  }

}
