import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { config } from './collection.config';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'fodinha';
  jogadorAtual: any = null;
  constructor(private db: AngularFirestore, private cookieService: CookieService, private router: Router) {
    this.jogadorAtual = this.cookieService.get("userId");
  }

  resetarJogo() {
    this.cookieService.deleteAll();
    this.router.navigate(['jogador/']);
    this.db.firestore.collection(config.jogadorDB).get().then(val => {
      val.forEach((doc) => {
        this.db.firestore.collection(config.jogadorDB).doc(doc.id).delete().then(() => console.log("deletado!"));
      })
    })
  }
}
