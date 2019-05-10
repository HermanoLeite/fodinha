import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { config } from '../collection.config';
import { map } from 'rxjs/operators';
import { Jogo } from '../jogo/jogo.model';
import { Status } from '../jogo/jogo.status';
import { JogoService } from '../jogo/jogo.service';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './jogo-init.component.html',
  styleUrls: ['./jogo-init.component.css']
})
export class JogoInitComponent implements OnInit {
  jogos;
  criandoJogo: Boolean = false;
  jogoNome: String;
  constructor(private db: AngularFirestore, private jogoService: JogoService) { }

  getStatus(status: Status) {
    if(status == Status.aguardandoJogadores) return "Agurdando Jogadores"
  }

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
