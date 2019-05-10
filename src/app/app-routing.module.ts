import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JogadorComponent } from './jogador/jogador.component';
import { JogoComponent } from './jogo/jogo.component';
import { JogoInitComponent } from './jogo-init/jogo-init.component';

const routes: Routes = [
  { path: '', component: JogoInitComponent },
  { path: 'jogo/:id', component: JogoComponent },
  { path: 'jogador', component: JogadorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
