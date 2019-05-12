import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { config } from '../collection.config';
import { map } from 'rxjs/operators';
import { Jogo } from '../jogo/jogo.model';
import { Status } from '../jogo/jogo.status';
import { JogoService } from '../jogo/jogo.service';
import { JogadorService } from '../jogador/jogador.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './jogo-init.component.html',
  styleUrls: ['./jogo-init.component.css']
})
export class JogoInitComponent implements OnInit {
  jogoDB;
  jogos;
  criandoJogo: Boolean = false;
  jogoNome: String;
  constructor(private db: AngularFirestore, private jogoService: JogoService, private jogadorService: JogadorService, private router: Router) { 
    this.jogoDB = this.db.collection(config.jogoDB);
  }

  getStatus(status: Status) {
    if(status == Status.aguardandoJogadores) return "Aguardando Jogadores"
    if(status == Status.jogando) return "Jogando"
    if(status == Status.finalizado) return "Finalizado"
  }


  criarJogo() {
    this.criandoJogo = !this.criandoJogo;
    this.jogoNome = null;
  }

  entrarJogo(jogoId) {
    this.router.navigate(['jogador', jogoId]);
  }

  deletarJogo(jogoId) {
    // jogo -> jogadores, rodada -> jogadores -> jogada -> jogadas
    this.jogoDB.doc(jogoId).delete();
  }

  salvarJogo() {
    if (this.jogoNome !== null) {
      this.jogoService.criarJogoInicio(this.jogoNome);
    }
    this.criandoJogo = !this.criandoJogo;
    this.jogoNome = null;
  }

  ngOnInit() {
    this.jogos = this.db.collection(config.jogoDB).snapshotChanges()
    .pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Jogo;
          const id = a.payload.doc.id;
          
          return { id, ...data };
        });
      }),
    );
  }

}
