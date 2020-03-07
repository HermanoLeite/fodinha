import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { JogoService } from '../../../service/jogo.service';

@Component({
  selector: 'criar-jogo',
  templateUrl: './criar-jogo.component.html',
  styleUrls: ['./criar-jogo.component.css']
})
export class CriarJogoComponent {
  criandoJogo: Boolean = false; 
  jogoNome: String;
  constructor(private db: AngularFirestore, private jogoService: JogoService) {}

  criarJogo() {
    this.criandoJogo = !this.criandoJogo;
    this.jogoNome = null;
  }

  salvarJogo() {
    if (this.jogoNome !== null) {
      this.jogoService.criarJogoInicio(this.jogoNome);
    }
    this.criandoJogo = !this.criandoJogo;
    this.jogoNome = null;
  }
}
