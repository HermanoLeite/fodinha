import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

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

  sairDoJogo() {
    this.cookieService.set("userId", "");
    this.router.navigate(['/']);
  }
}
