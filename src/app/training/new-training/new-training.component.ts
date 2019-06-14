import {Component, OnDestroy, OnInit} from '@angular/core';
import {TrainingService} from '../training.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Exercise} from '../exercise.model';
import {UiService} from '../../shared/ui.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  availableExercises: Exercise[];
  exerciseSubscription: Subscription;

  isLoading: boolean;
  private loadingSubscription: Subscription;

  constructor(private trainingService: TrainingService,
              private uiService: UiService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
      response => {
        this.isLoading = response;
      }
    );
    this.exerciseSubscription = this.trainingService.availableExercisesChanged.subscribe(exercises => this.availableExercises = exercises);
    this.fetchExercises();
  }

  fetchExercises(): void {
    this.trainingService.fetchAvailableExercises();
  }

  ngOnDestroy(): void {
    if (this.exerciseSubscription) {
      this.exerciseSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  onStartTraining(form: NgForm): void {
    this.trainingService.startExercise(form.value.exercise);
  }

}
