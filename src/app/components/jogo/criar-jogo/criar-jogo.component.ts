import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { JogoService } from '../../../service/jogo.service';

@Component({
  selector: 'criar-jogo',
  templateUrl: './criar-jogo.component.html'
})
export class CriarJogoComponent {
  criandoJogo: Boolean = false;
  jogoNome: String;
  constructor(private db: AngularFirestore, private jogoService: JogoService) { }

  iniciar() {
    this.criandoJogo = true;
    this.jogoNome = null;
  }

  fechar() {
    this.criandoJogo = false;
    this.jogoNome = null;
  }

  salvar() {
    if (this.jogoNome !== null) {
      this.jogoService.criarJogoInicio(this.jogoNome);
    }
    this.fechar();
  }
}
