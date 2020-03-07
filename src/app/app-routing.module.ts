import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JogadorComponent } from './containers/jogador/jogador.component';
import { JogoComponent } from './containers/jogo/jogo.component';
import { JogoInitComponent } from './containers/jogo-init/jogo-init.component';

const routes: Routes = [
  { path: '', component: JogoInitComponent },
  { path: 'jogo/:id', component: JogoComponent },
  { path: 'jogador/:id', component: JogadorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
