import {Injectable} from '@angular/core';
import {Exercise} from './exercise.model';
import {Subject, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable()
export class TrainingService {

  exerciseChanged = new Subject<Exercise>();
  availableExercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private finishedExercises: Exercise[] = [];

  private firebaseSubscriptions: Subscription[] = [];

  constructor(private angularFireStore: AngularFirestore) {
  }

  /**
   * Fetch the available exercises in the Firebase database and update the array and emit them when changes
   */
  fetchAvailableExercises(): void {
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
          this.availableExercises = exercises;
          this.availableExercisesChanged.next([...this.availableExercises]);
        })
    );
  }

  /**
   * Find the exercise in the availableExercises array and set it in the runningExercise variable
   *
   * @param selectedId Id of the selected exercise
   */
  startExercise(selectedId: string): void {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next({...this.runningExercise});
  }

  /**
   * Return the current runningExercise
   */
  getRunningExercise(): Exercise {
    return {...this.runningExercise};
  }

  /**
   * Mark the runningExercise as completed and store it in the Firestore database, in the finishedExercises collection
   */
  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  /**
   * Mark the runningExercise as cancelled, calculate the duration and calories with the progress done,
   * and store it in the Firestore database, in the finishedExercises collection
   *
   * @param progress Percentaje of the duration done
   */
  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
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
          this.finishedExercises = exercises;
          this.finishedExercisesChanged.next([...this.finishedExercises]);
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
