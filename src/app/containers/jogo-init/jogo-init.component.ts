import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/service/local-storage';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './jogo-init.component.html',
})
export class JogoInitComponent {
  constructor(private localStorageService: LocalStorageService) {
    this.localStorageService.clear()
  }
}
