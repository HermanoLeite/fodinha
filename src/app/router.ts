import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JogadorComponent } from './containers/jogador';
import { JogoComponent } from './containers/jogo';
import { JogoInitComponent } from './containers/jogo-init';

const routes: Routes = [
  { path: '', component: JogoInitComponent },
  { path: 'jogo/:id', component: JogoComponent },
  { path: 'jogador/:id', component: JogadorComponent },
  { path: '**', component: JogoInitComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class Router { }
