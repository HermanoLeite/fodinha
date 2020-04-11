import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JogadorComponent } from './components/jogador';
import { JogoComponent } from './components/jogo';
import { JogoInitComponent } from './components/jogo-init';

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
