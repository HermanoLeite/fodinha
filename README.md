# fodinha

Fodinha é um jogo de cartas (já vi com vários outros nomes, mas eu conheci ele como fodinha) que eu costumava jogar no bar com os amigos.
Criei o projeto do jogo para conhecer um pouco mais a ferramenta [Firebase](https://firebase.google.com/) e treinar fazer um projeto do zero.

Apesar de não estar com uma boa arquitetura e ainda permitindo roubar facilmente, o jogo está funcional.

Sinta-se a vontade para contribuir com o projeto ;)

## O jogo

### Overview
Fodinha é um jogo individual que pode ser jogado com 2 a 8 jogadores (até possível jogar com mais, mas fica meio palha)
Ganha o último jogador que permanecer no jogo com vida.
Cada jogador começa o jogo com 5 vidas, e vai as perdendo conforme vai errando o palpite nas rodadas.

Para começar, crie ou entre em um jogo, coloque seu nome e cor, e clique em **começar**.

### Quantidade de cartas
A cada rodada a quantidade de cartas que cada jogador recebe vai aumentando. 
Rodada 1, 1 carta para cada jogador. Rodada 2, 2 cartas. Rodada 3, 3 cartas... Caso chegue o baralho chegue ao fim, então as cartas vão decrescendo até chegar a 1, depois crescendo novamente.

### Palpite
O objetivo do jogador é advinhar quantas cartas ele vai *fazer na rodada. Caso ele erre seu palpite (ex: Fez o palpite que iria fazer 1 jogada mas fez 2), então perde a diferença entre a quantidade do palpite e quantidade que fez.

*fazer significa que a sua carta é a maior de todas na jogada. Desse forma você "fez" a jogada.

### Ordem das cartas
A Ordem das cartas é igual ao truco paulista (aquele que tem a manilha móvel, aquela que vira. Sabe?). A ordem das cartas é: 4, 5, 6, 7, Q, J, K, A, 2, 3.
Dessa forma, o 5 ganha do 4, o 6 ganha do 5, o 7 ganha do 6, e etc.. Cartas iguais (que não forem manilha), ninguém ganha!

### Manilha
Após as cartas serem distribuidas para os jogadores, uma carta é virada. Esta é chamada vira, ela decide qual carta é a manilha.
A manilha é a carta um acima da vira. Se vira o 4, a manilha é o 5. Se vira o 5 a manilha é o 6... se vira o 7 a manilha é o Q... se vira o 3 a manilha é o 4.

A manilha é a carta mais forte do jogo nessa rodada. Para esta carta, o naipe importa. Sendo assim, a ordem dos naipes é: ouros, espadas, copas, paus. **Não existe empate entre manilhas**

## Como rodar o projeto
Necessário fazer uma conta no firebase, já que o projeto roda todo lá (não sei se dá para rodar localmente). Talvez [esse](https://medium.com/factory-mind/angular-cloud-firestore-step-by-step-bootstrap-tutorial-ecb96db8d071) tutorial ajude.

O projeto está em angular.

Então, estando com o projeto, basta rodar:
```bash
npm install
``` 
e depois 
```bash
ng serve
```
Se tudo estiver o correto, o projeto deveria rodar.

## tasks
O Backlog das atividades estão no [trello](https://trello.com/b/31NPr2F0/fodinha)
