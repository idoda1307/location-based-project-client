import {Component, OnInit, OnDestroy} from '@angular/core';
import { Marker } from '../models/marker.model';
import { Subscription } from 'rxjs';
import { EventsService } from '../services/event.service';
import { MyAuthService } from '../../auth/auth.service';

@Component ({
  selector: 'app-user-events',
  templateUrl: './user-events.component.html',
  styleUrls: ['./user-events.component.css']
  })

  export class UserEventsComponent implements OnInit, OnDestroy {
    events: Marker[] = [];
    isLoading = false;
    userIsAuthenticated = false;
  userId: string;
  private eventsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(
    public eventsService: EventsService,
    private authService: MyAuthService
  ) {}
  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.eventsService.getUserEvents(this.userId);
    this.eventsSub = this.eventsService
      .getEventUpdateListener().subscribe((eventData: { events: Marker[]; }) => {
        this.isLoading = false;
        this.events = eventData.events;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

   onDelete(eventId: string) {
     this.isLoading = true;
     this.eventsService.deleteEvent(eventId);
   }
  ngOnDestroy() {
    this.eventsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  }
