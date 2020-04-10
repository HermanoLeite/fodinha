import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/service/local-storage';
import { Router } from '@angular/router';
import { JogoService } from 'src/app/service/jogo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './jogo-init.component.html',
})
export class JogoInitComponent {
  private jogos: Observable<any>;

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
    private jogoService: JogoService) {
    this.localStorageService.clear()
  }

  ngOnInit() {
    this.jogos = this.jogoService.jogosStream()
  }
}
