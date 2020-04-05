import { Component, OnInit, Input } from '@angular/core';
import { JogadorService } from 'src/app/service/jogador.service';
import { ActivatedRoute } from '@angular/router';
import { collections } from '../../../context';
import { AngularFirestore } from '@angular/fire/firestore';
import { Jogador } from 'src/app/models/jogador';
import { map } from 'rxjs/operators';

@Component({
  selector: 'listar-jogadores',
  templateUrl: './listar-jogadores.component.html',
})
export class ListarJogadoresComponent implements OnInit {
  jogadores;
  jogoId: string;
  @Input() jogadorDocId: string;

  constructor(private db: AngularFirestore, private jogadorService: JogadorService, private route: ActivatedRoute) {
    this.jogoId = route.snapshot.paramMap.get("id");
  }

  removerJogador(jogador) {
    this.jogadorService.removerJogador(jogador, this.jogoId);
  }

  ngOnInit() {
    var jogoDB = this.db.collection(collections.jogo).doc(this.jogoId);
    var jogadorDB = jogoDB.collection(collections.jogador);

    this.jogadores = jogadorDB.snapshotChanges().pipe(
      map(actions => {
        return actions.map(({ payload }) => {
          const data = payload.doc.data() as Jogador;
          const id = payload.doc.id;

          return { id, ...data };
        });
      }),
    )
  }

}
