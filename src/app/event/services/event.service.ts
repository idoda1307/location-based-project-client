import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '../models/location.model';
import { Marker } from '../models/marker.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  marker: Marker;
  private events: Marker[] = [];
  private newEvent = new Subject<any>();
  location = new Subject<Location>();

 constructor(private http: HttpClient, private router: Router) {}

 addEvent(title: string, description: string, location: Location, dateStarted: Date, dateEnded: Date) {

  const event: Marker = {id: null, location: location , title: title,
   description: description, creator: null, dateStarted: dateStarted, dateEnded: dateEnded};
  this.http
    .post<{ message: string; event: Marker }>('http://localhost:3000/api/event/createevent', event)
    .subscribe(responseData => {
this.router.navigate(['./map']);
    });
   }

getEvent(id: string) {
return this.http.get<{_id: string; lat: number; lng: number; title: string; description: string; creator: string,
   dateStarted: Date, dateEnded: Date}>(
  'http://localhost:3000/api/event/' + id
);
}

getUserEvents(userId: string) {
  this.http
  .get<{ message: string; events: any }>('http://localhost:3000/api/event/userevents/' + userId)
  .pipe(
    map(eventData => {
      return eventData.events.map(event => {
        return {
          location: {lat: event.lat, lng: event.lng},
          title: event.title,
          description: event.description,
          id: event._id,
          creator: event.creator,
          dateStarted: event.dateStarted,
          dateEnded: event.dateEnded
        };
      });
    })
  )
  .subscribe(transformedEvents => {
    this.events = transformedEvents;
    this.newEvent.next([...this.events]);
  });
}

getEvents() {
  this.http
    .get<{ message: string; events: any }>('http://localhost:3000/api/event')
    .pipe(
      map(eventData => {
        return eventData.events.map(event => {
          return {
            location: {lat: event.lat, lng: event.lng},
            title: event.title,
            description: event.description,
            id: event._id,
            creator: event.creator,
            dateStarted: event.dateStarted,
            dateEnded: event.dateEnded
          };
        });
      })
    )
    .subscribe(transformedEvents => {
      this.events = transformedEvents;
      this.newEvent.next([...this.events]);
    });
}

getEventUpdateListener() {
  return this.newEvent.asObservable();
}

updateEvent(id: string, title: string, description: string, location: Location, dateStarted: Date, dateEnded: Date) {
  let eventData: Marker | FormData;
    eventData = {
      id: id,
      title: title,
      description: description,
      location: location,
      creator: null,
      dateStarted: dateStarted,
      dateEnded: dateEnded
    };
    this.http
    .put('http://localhost:3000/api/event/' + id, eventData)
    .subscribe(response => {
      console.log(response);
    });
}

deleteEvent(eventId: string) {
  return this.http.delete('http://localhost:3000/api/event/' + eventId).subscribe(() => {
    const updatedEvents = this.events.filter(e => e.id !== eventId);
    this.events = updatedEvents;
    this.newEvent.next([...this.events]);
  });
}
}
