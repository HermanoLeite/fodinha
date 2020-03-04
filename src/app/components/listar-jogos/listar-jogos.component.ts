import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { config } from '../../collection.config';
import { Status } from 'src/app/containers/jogo/jogo.status';
import { Router } from '@angular/router';
import { JogoService } from 'src/app/containers/jogo/jogo.service';
import { Jogo } from 'src/app/containers/jogo/jogo.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'listar-jogos',
  templateUrl: './listar-jogos.component.html',
  styleUrls: ['./listar-jogos.component.css']
})
export class ListarJogosComponent implements OnInit {
  jogoDB;
  jogos;
  criandoJogo: Boolean = false;
  jogoNome: String;
  constructor(
    private db: AngularFirestore, 
    private router: Router) 
  { 
    this.jogoDB = this.db.collection(config.jogoDB);
  }

  getStatus(status: Status) {
    if(status == Status.aguardandoJogadores) return "Aguardando Jogadores"
    if(status == Status.jogando) return "Jogando"
    if(status == Status.finalizado) return "Finalizado"
  }

  entrarJogo(jogo) {
    if(jogo.status === Status.finalizado) {
      this.router.navigate(['jogo', jogo.id]);
    }
    else {
      this.router.navigate(['jogador', jogo.id]);
    }
  }

  deletarJogo(jogoId) {
    // jogo -> jogadores, rodada -> jogadores -> jogada -> jogadas
    this.jogoDB.doc(jogoId).delete();
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
