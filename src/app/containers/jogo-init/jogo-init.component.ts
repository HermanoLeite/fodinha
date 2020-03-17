import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './jogo-init.component.html',
})
export class JogoInitComponent {
  constructor(private cookieService: CookieService) {
    this.cookieService.set("userId", "");
    this.cookieService.set("jogoId", "");
  }
}
