import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { SwPush } from '@angular/service-worker';

@Injectable()
export class NotificationsService {
    constructor(private http: HttpClient, private swPush: SwPush) {}
    sub: PushSubscription;
    readonly VAPID_PUBLIC_KEY = 'BFsjeYO7F2jfDBJYF8fhGGWK1knggiFN8uxEpslVLgBw5i5VNQlPan7s-jNw-NAR4L-DQo0_YWZfov1EkCxbyHI';

     addPushSubscriber(sub: any) {
         return this.http.post('http://localhost:3000/api/notification/add', sub);
     }

     send() {
      return this.http.post('http://localhost:3000/api/notification/send', null);
  }

     subscribeToNotifications() {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {

        this.sub = sub;


        console.log('Notification Subscription: ', sub);

        this.addPushSubscriber(sub).subscribe(
            () => console.log('Sent push subscription object to server.'),
            err =>  console.log('Could not send subscription object to server, reason: ', err)
        );

    })
    .catch(err => console.error('Could not subscribe to notifications', err));

   }

   sendNotifications() {


    console.log('Sending notifications to all Subscribers ...');

    this.send().subscribe();
}
}
