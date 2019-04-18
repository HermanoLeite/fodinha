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
  rodadas: any;

  constructor(private db: AngularFirestore, private jogoService: JogoService, private router: Router, private route: ActivatedRoute) { 
  }

  loadRodada(rodadaId) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.collection(config.rodadaDB).doc(rodadaId).snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
        console.log("rodadas: " + JSON.stringify(data));
        return { id, ...data };
      })
    ).subscribe(rodadas => this.rodadas = rodadas)
  }

  ngOnInit() {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
        console.log("jogo: " + JSON.stringify(data));
        this.loadRodada(data.rodada.toString());
        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo)
  }
}