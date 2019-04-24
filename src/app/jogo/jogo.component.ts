import { JogoService } from './jogo.service';
import { Component, OnInit } from '@angular/core';
import { map, first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { config } from '../collection.config';

import { Jogo } from './jogo.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-jogo',
  templateUrl: './jogo.component.html',
  styleUrls: ['./jogo.component.css']
})
export class JogoComponent implements OnInit {
  jogo:any;
  jogadores: any;
  jogadoresJogo: any;
  rodada: any;
  jogadorJogandoId: any;
  jogadorJogando: any;

  constructor(private db: AngularFirestore, private jogoService: JogoService, private router: Router, private route: ActivatedRoute) { 
  }

  // TODO levar isso para o servico da rodada
  loadRodada(rodadaId) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    this.jogadoresJogo = query.collection("jogadores").snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          console.log("jogo.jogadores: " + id + " - " + JSON.stringify(data));
          return { id, ...data };
        });
      }),
    );

    query.collection(config.rodadaDB).doc(rodadaId).snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data();
        const id = a.payload.id;
        console.log("rodada: " + JSON.stringify(data));
        return { id, ...data };
      })
    ).subscribe(rodada => this.rodada = rodada)

    this.jogadores = query.collection(config.rodadaDB).doc(rodadaId).collection("jogadores").snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          if (data.jogadorId === this.jogadorJogandoId) {
            this.jogadorJogando = { id, ...data };
          }
          console.log("jogadores: " + id + " - " + JSON.stringify(data));
          return { id, ...data };
        });
      }),
    );
  }

  ngOnInit() {
    this.jogadorJogandoId = this.jogoService.jogadorCriado();
    console.log("meu id = " + this.jogadorJogandoId);

    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
        console.log("jogo: " + JSON.stringify(data));
        this.loadRodada(data.rodada.toString());
        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo);  
    
    
  }
}