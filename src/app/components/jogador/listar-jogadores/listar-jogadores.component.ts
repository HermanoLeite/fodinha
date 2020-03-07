import { Component, OnInit } from '@angular/core';
import { JogadorService } from 'src/app/service/jogador.service';
import { ActivatedRoute } from '@angular/router';
import { config } from '../../../collection.config';
import { AngularFirestore } from '@angular/fire/firestore';
import { Jogador } from 'src/app/containers/jogador/jogador.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'listar-jogadores',
  templateUrl: './listar-jogadores.component.html',
})
export class ListarJogadoresComponent implements OnInit {
  jogadores;
  jogoId: string;
  jogadorDocId : string;
  
  constructor(private db: AngularFirestore, private jogadorService: JogadorService, private route: ActivatedRoute) { 
    this.jogoId = route.snapshot.paramMap.get("id");
    this.jogadorDocId = jogadorService.jogadorCriado();
  }

  removerJogador(jogador) {
    jogador.removido = true;
    this.jogadorService.updatejogador(jogador.id, jogador, this.jogoId);
  }

  ngOnInit() {  
    var jogoDB = this.db.collection(config.jogoDB).doc(this.jogoId);
    var jogadorDB = jogoDB.collection(config.jogadorDB);

    this.jogadores = jogadorDB.snapshotChanges().pipe(
      map(actions => {
        return actions.map(({ payload }) => {
          const data = payload.doc.data() as Jogador;
          const id = payload.doc.id;

          return { id, ...data };
        });
      }),
    );
  }

}
