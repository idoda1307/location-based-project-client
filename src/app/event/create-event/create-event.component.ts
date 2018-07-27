import { Component, OnInit, OnDestroy, Input,  Inject} from '@angular/core';
import { Location } from '../models/location.model';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { EventsService } from '../services/event.service';
import { Marker } from '../models/marker.model';
import { Subscription } from 'rxjs';
import { MyAuthService } from '../../auth/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorComponent } from '../../error/error.component';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit, OnDestroy {
  @Input() location: Location;
  marker: Marker;
  isLoading = false;
  form: FormGroup;
  private eventId: string;
  private authStatusSub: Subscription;
  btnName: string;
  constructor(
    public eventssService: EventsService,
    public route: ActivatedRoute,
    private authService: MyAuthService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private notificationService: NotificationsService,
    public dialogRef: MatDialogRef<CreateEventComponent>,
    public errorDialogRef: MatDialogRef<ErrorComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { location: Location; eventId: string; mode: string }
  ) {}

  ngOnInit() {
    if (this.data.mode === 'create') {
      this.btnName = 'Add Event';
    } else {
      this.btnName = 'Update Event';
    }
    this.notificationService.subscribeToNotifications();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.eventId = null;
    this.form = this.fb.group({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      description: new FormControl(null, { validators: [Validators.required] }),
      startDate: new FormControl(null, { validators: [Validators.required] }),
      endDate: new FormControl(null, { validators: [Validators.required] })
    });
  }

  onAddEvent() {
    console.log(this.data.mode);
    if (this.form.value.startDate >= this.form.value.endDate) {
      const errorDialogRef = this.dialog.open(ErrorComponent, {
        width: '250px',
        data: {message: 'your start date must be before your end date' }
      });
      return;
      } else {
    if (this.data.mode === 'create') {
      // this.btnName = 'Add Event';
      if (this.form.invalid) {
        return;
      }
      // this.isLoading = true;
      this.eventssService.addEvent(
        this.form.value.title,
        this.form.value.description,
        this.data.location,
        this.form.value.startDate,
        this.form.value.endDate
      );
      this.marker = {
        id: null,
        title: this.form.value.title,
        description: this.form.value.description,
        location: this.data.location,
        creator: this.authService.getUserId(),
        dateStarted: this.form.value.startDate,
        dateEnded: this.form.value.endDate
      };
      console.log(this.form.value.title);
      this.notificationService.sendNotifications();
      this.dialogRef.close(this.marker);
    } else if (this.data.mode = 'edit') {
     // this.btnName = 'Update Event';
      this.eventssService.updateEvent(
        this.data.eventId,
        this.form.value.title,
        this.form.value.description,
        this.data.location,
        this.form.value.startDate,
        this.form.value.endDate
      );
      this.marker = {
        id: this.data.eventId,
        title: this.form.value.title,
        description: this.form.value.description,
        location: this.data.location,
        creator: this.authService.getUserId(),
        dateStarted: this.form.value.startDate,
        dateEnded: this.form.value.endDate
      };
      this.dialogRef.close(this.marker);
    }
  }
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
