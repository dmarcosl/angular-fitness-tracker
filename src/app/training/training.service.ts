import {Injectable} from '@angular/core';
import {Exercise} from './exercise.model';
import {Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';
import {UiService} from '../shared/ui.service';
import {Store} from '@ngrx/store';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';

@Injectable()
export class TrainingService {

  private firebaseSubscriptions: Subscription[] = [];

  constructor(private angularFireStore: AngularFirestore,
              private uiService: UiService,
              private store: Store<fromTraining.State>) {
  }

  /**
   * Fetch the available exercises in the Firebase database and update the array and emit them when changes
   */
  fetchAvailableExercises(): void {
    this.store.dispatch(new UI.StartLoading());

    this.firebaseSubscriptions.push(
      this.angularFireStore
        .collection('availableExercises')
        .snapshotChanges()
        .pipe(
          // This complicate thing is to get the document id and the rest of values
          map(docArray => {
            return docArray.map(doc => {
              return {
                id: doc.payload.doc.id,
                ...doc.payload.doc.data()
              };
            });
          })
        )
        .subscribe((exercises: Exercise[]) => {
          this.store.dispatch(new UI.StopLoading());
          this.store.dispatch(new Training.SetAvailableTrainings(exercises));
        }, error => {
          this.store.dispatch(new UI.StopLoading());
          this.uiService.showSnackbar('Fetching Exercises failed, please ty again later', null, 3000);
        })
    );
  }

  /**
   * Find the exercise in the availableExercises array and set it in the runningExercise variable
   *
   * @param selectedId Id of the selected exercise
   */
  startExercise(selectedId: string): void {
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  /**
   * Mark the runningExercise as completed and store it in the Firestore database, in the finishedExercises collection
   */
  completeExercise() {
    this.store.select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe(ex => {
        this.addDataToDatabase({
          ...ex,
          date: new Date(),
          state: 'completed'
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  /**
   * Mark the runningExercise as cancelled, calculate the duration and calories with the progress done,
   * and store it in the Firestore database, in the finishedExercises collection
   *
   * @param progress Percentaje of the duration done
   */
  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe(ex => {
        this.addDataToDatabase({
          ...ex,
          duration: ex.duration * (progress / 100),
          calories: ex.calories * (progress / 100),
          date: new Date(),
          state: 'cancelled'
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  /**
   * Add an exercise to the Firebase database, in the finishedExercises collection
   *
   * @param exercise Exercise to store
   */
  private addDataToDatabase(exercise: Exercise): void {
    this.angularFireStore.collection('finishedExercises').add(exercise);
  }

  /**
   * Fetch the finished exercises in the Firebase database and update the array and emit them when changes
   */
  fetchCompletedOrCancelledExercises(): void {
    this.firebaseSubscriptions.push(
      this.angularFireStore
        .collection('finishedExercises')
        .valueChanges()
        .subscribe((exercises: Exercise[]) => {
          this.store.dispatch(new Training.SetFinishedTrainings(exercises));
        })
    );
  }

  /**
   * Cancel all subscriptions
   */
  cancelSubscriptions(): void {
    this.firebaseSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
