import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class UiService {

  constructor(private snackbar: MatSnackBar) {
  }

  showSnackbar(message, action, duration): void {
    this.snackbar.open(message, action, {
      duration: duration
    });
  }
}
