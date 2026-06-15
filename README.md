# GeekVerse G8

## Descrição do projeto

O GeekVerse G8 é uma aplicação web desenvolvida em React para o Trabalho Final de Integração da disciplina de Desenvolvimento Web Front-End.

O projeto reúne quatro jogos interativos com temática geek. Cada jogo usa uma API pública diferente e mostra os dados recebidos de forma visual, além de exibir exemplos de JSON formatado.

A aplicação também possui login, rotas protegidas, dashboard, ranking, auditoria de sessão, formulário de contato com EmailJS, página Sobre e uma página 404 personalizada.

## Tipo de aplicação

O GeekVerse G8 foi desenvolvido como uma SPA, ou seja, uma aplicação de página única.

Mesmo tendo várias telas internas, como Login, Dashboard, Jogos, Ranking, Sobre e Página 404, a navegação acontece dentro da própria aplicação, sem recarregar uma nova página HTML a cada troca de tela.

As rotas foram organizadas com React Router DOM.

## Tema escolhido

Jogos interativos com APIs geek.

Escolhemos esse tema porque ele permite aplicar, em um único projeto, vários conteúdos trabalhados na disciplina, como consumo de APIs, componentes, estados, eventos, rotas, tratamento de erros, JSON formatado e envio de e-mail.

## Objetivo do sistema

O objetivo do sistema é apresentar uma aplicação web interativa, organizada e funcional usando React e APIs públicas.

Além dos jogos, o projeto busca demonstrar o uso de autenticação simples, rotas privadas, ranking, auditoria, integração com Supabase, integração com EmailJS e organização de código em componentes, páginas, hooks e serviços.

## Integrantes

- Gabriel Fagundes Motta
- Ítalo Dias Moreira Campos
- Julyanne Lauriano Genevain
- Rakel Garcia da Silva
- Raphaell Reiff Galoni

## Jogos desenvolvidos

### Memórias dos Bruxos

Jogo da memória baseado na Harry Potter API.

O usuário escolhe a dificuldade, encontra os pares de personagens e pode registrar o resultado no ranking. O jogo trabalha com personagens, cartas, tentativas, tempo, feedback visual e exibição de dados em JSON.

### Show do Multiverso

Quiz baseado na Rick and Morty API.

O jogador responde perguntas sobre personagens, usa dicas e acumula pontuação conforme avança. O jogo também mostra dados da API em formato JSON e registra resultados no ranking.

### PokéSombra

Jogo baseado na PokéAPI.

O objetivo é identificar o Pokémon correto usando silhueta, dicas e informações exibidas durante a partida. O jogo trabalha com carregamento de dados, validação de resposta, erros, tempo e pontuação.

### Fuga do Hiperespaço

Jogo baseado na SWAPI.

O usuário monta uma missão e controla uma nave para sobreviver aos obstáculos. O jogo possui contagem regressiva, HUD, dificuldade, obstáculos direcionados, ranking e suporte experimental a controle apenas para mover a nave.

## Funcionalidades principais

- Tela de login.
- Redirecionamento após login.
- Logout.
- Rotas públicas e privadas.
- Proteção de rotas internas.
- Dashboard inicial com acesso aos jogos.
- Quatro jogos usando APIs públicas.
- Exibição de JSON formatado.
- Tratamento de erros de API e de uso.
- Loaders durante carregamentos.
- Página de ranking.
- Registro de resultados no Supabase.
- Auditoria de sessão.
- Página Sobre com informações do grupo e do projeto.
- Formulário de contato com EmailJS.
- Página 404 personalizada.
- Uso de React Icons.
- Uso de React Spinners.
- Layout responsivo.
- Fullscreen em partes da aplicação.
- Suporte experimental a gamepad no jogo Fuga do Hiperespaço.

## APIs utilizadas

O projeto usa quatro APIs públicas, uma para cada jogo.

- Harry Potter API: usada no jogo Memórias dos Bruxos.
- Rick and Morty API: usada no jogo Show do Multiverso.
- PokéAPI: usada no jogo PokéSombra.
- SWAPI: usada no jogo Fuga do Hiperespaço.

Links das APIs:

- https://hp-api.onrender.com/
- https://rickandmortyapi.com
- https://pokeapi.co
- https://swapi.tech/

## Tecnologias utilizadas

- React
- Vite
- JavaScript
- React Router DOM
- Supabase
- EmailJS
- React Icons
- React Spinners
- CSS
- Git e GitLab
- Vercel

## Como funciona o ranking e a auditoria

O ranking salva os resultados dos jogos no Supabase.

Os resultados podem incluir informações como jogo, jogador, dificuldade, pontuação, tempo, tentativas e outras estatísticas importantes de cada partida.

A auditoria registra eventos importantes de navegação e uso do sistema. A página Sobre também mostra um resumo local da sessão, ajudando a demonstrar o funcionamento da aplicação durante a apresentação.

As chaves reais do Supabase não devem ser colocadas diretamente no README nem enviadas para o repositório.

## Como funciona o envio por e-mail

O formulário de contato usa EmailJS.

O envio depende das variáveis de ambiente configuradas no projeto. O sistema também pode enviar informações relacionadas à auditoria, conforme a configuração do EmailJS.

O arquivo `.env` não deve ser enviado para o repositório, pois pode conter chaves reais de integração.

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js
- npm

## Como executar o projeto

Clone ou baixe este repositório.

Acesse a pasta do projeto:

```bash
cd NOME_DA_PASTA
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo de ambiente a partir do modelo:

```bash
cp .env.example .env
```

No Windows, o arquivo `.env` também pode ser criado manualmente copiando o conteúdo do `.env.example`.

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```text
http://localhost:5173/
```

A porta pode mudar caso a 5173 já esteja em uso. Se isso acontecer, verifique a porta indicada no terminal.

## Configuração do ambiente

Para o Supabase e o EmailJS funcionarem, é necessário criar um arquivo `.env` na raiz do projeto.

Use o arquivo `.env.example` como modelo.

Exemplo de variáveis usadas no projeto:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_CONTATO=
VITE_EMAILJS_TEMPLATE_EXPORTACAO=
VITE_EMAILJS_PUBLIC_KEY=
VITE_EMAILJS_TEMPLATE_GAME_RESULT=
VITE_EMAILJS_RANKING_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_RANKING=
VITE_EMAILJS_RANKING_PUBLIC_KEY=
VITE_EMAILJS_TEMPLATE_AUDIT=
```

Não coloque valores reais de chaves no README.

## Acesso ao sistema

O acesso ao sistema é feito pela tela de login configurada no projeto.

Após o login, o usuário é redirecionado para o Dashboard. As rotas internas ficam protegidas e o logout encerra a sessão, retornando o usuário para a tela de login.

## Estrutura geral do projeto

```text
src/
├── assets/
├── components/
├── contexts/
├── data/
├── experimental/
├── hooks/
├── pages/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

A pasta `components` guarda componentes reutilizáveis.

A pasta `pages` guarda as telas principais e os jogos.

A pasta `services` concentra integrações com APIs, Supabase, EmailJS, ranking e auditoria.

A pasta `hooks` guarda lógicas reutilizáveis dos jogos e da aplicação.

A pasta `assets` guarda imagens, fundos, áudios e outros recursos visuais.

A pasta `experimental` guarda recursos em teste, como o suporte experimental a gamepad.

## Rotas principais

- `/login`: tela de login.
- `/app`: dashboard.
- `/app/harry-potter`: jogo Memórias dos Bruxos.
- `/app/rick-morty`: jogo Show do Multiverso.
- `/app/pokemon`: jogo PokéSombra.
- `/app/star-wars`: jogo Fuga do Hiperespaço.
- `/app/ranking`: ranking geral.
- `/app/ranking/:gameId`: ranking por jogo.
- `/app/sobre`: página sobre o projeto.
- `*`: página 404 personalizada.

## Exemplos de JSON formatado

Durante os jogos, os dados recebidos das APIs podem ser exibidos em formato JSON. Isso ajuda a demonstrar o consumo das APIs e a manipulação dos dados retornados.

### Harry Potter API

```json
{
  "name": "Harry Potter",
  "house": "Gryffindor",
  "wizard": true
}
```

### Rick and Morty API

```json
{
  "name": "Rick Sanchez",
  "status": "Alive",
  "species": "Human"
}
```

### PokéAPI

```json
{
  "name": "pikachu",
  "types": ["electric"],
  "base_experience": 112
}
```

### SWAPI

```json
{
  "name": "Tatooine",
  "climate": "arid",
  "terrain": "desert"
}
```

## Testes realizados

Durante o desenvolvimento, foram testados os principais fluxos da aplicação:

- Login inválido.
- Login válido.
- Redirecionamento após login.
- Acesso a rotas protegidas.
- Logout.
- Acesso ao Dashboard.
- Acesso aos quatro jogos.
- Consumo das quatro APIs.
- Exibição de JSON formatado.
- Tratamento de carregamento.
- Tratamento de erro.
- Registro no ranking.
- Página de ranking.
- Página Sobre.
- Formulário de contato.
- Auditoria da sessão.
- Página 404 personalizada.
- Build final do projeto.


## Créditos e fontes

APIs e ferramentas usadas no projeto:

- Harry Potter API
- Rick and Morty API
- PokéAPI
- SWAPI
- React
- Vite
- Supabase
- EmailJS

## Demonstração visual do sistema

Os prints abaixo apresentam os principais fluxos do GeekVerse G8 em funcionamento. Cada tela demonstra, na prática, conceitos trabalhados na disciplina de Desenvolvimento Web Front End, como React, componentes, estado, eventos, rotas, consumo de APIs, ranking, auditoria e integração com EmailJS.

### 1. Login e autenticação

![Tela de Login](prints/01-login.png)

A tela de login é a entrada do usuário no sistema. Nela, usamos estado para controlar os campos do formulário, evento de envio para validar os dados e navegação para direcionar o jogador ao dashboard após a autenticação.

### 2. Dashboard principal

![Dashboard](prints/02-dashboard.png)

O dashboard funciona como a tela central da aplicação. Ele organiza os jogos em cards e permite a navegação interna entre os módulos do sistema, mantendo a proposta de uma SPA desenvolvida em React.

### 3. Memória dos Bruxos

![Memória dos Bruxos](prints/03-harry-potter.png)

No jogo Memória dos Bruxos, usamos estado para controlar cartas viradas, pares encontrados, tentativas, tempo e status da partida. A interação acontece por eventos de clique, e a interface é atualizada conforme o progresso do jogador.

### 4. PokeSombra: seleção de dificuldade

![PokeSombra - Seleção](prints/04-pokemon-inicio.png)

Nesta tela, o jogador escolhe a dificuldade antes de iniciar a partida. Esse fluxo demonstra o uso de estado para armazenar a opção selecionada e renderização condicional para preparar o desafio conforme o nível escolhido.

### 5. PokeSombra: partida

![PokeSombra - Partida](prints/05-pokemon-partida.png)

Durante a partida do PokeSombra, o sistema utiliza dados da PokéAPI para montar o desafio. A tela controla Pokémon atual, dicas, respostas, erros, acertos e tempo, mostrando a integração entre API externa e estado em React.

### 6. PokeSombra: resultado

![PokeSombra - Resultado](prints/06-pokemon-vitoria.png)

A tela de resultado mostra a finalização da partida e o desempenho do jogador. Esse fluxo demonstra cálculo de resultado, feedback visual, controle do status do jogo, integração com ranking e possibilidade de exportação.

### 7. Show do Multiverso: início

![Show do Multiverso - Início](prints/07-rick-morty-inicio.png)

No início do Show do Multiverso, o jogador escolhe o modo de jogo. A tela demonstra navegação interna, seleção de dificuldade e preparação da partida com componentes reutilizáveis e controle de estado.

### 8. Show do Multiverso: partida

![Show do Multiverso - Partida](prints/08-rick-morty-partida.png)

Durante a partida, usamos estado para controlar pergunta atual, alternativas, pontuação, dicas e progresso. As respostas são processadas por eventos de clique, atualizando a interface de forma dinâmica.

### 9. Show do Multiverso: resultado

![Show do Multiverso - Resultado](prints/09-rick-perda.png)

A tela de resultado demonstra o tratamento do fim da partida, seja em caso de vitória ou derrota. Esse print mostra feedback ao usuário, renderização condicional e controle do estado final do jogo.

### 10. Fuga do Hiperespaço: seleção

![Fuga do Hiperespaço - Seleção](prints/10-starwars-inicio.png)

Na Fuga do Hiperespaço, usamos um fluxo por etapas para montar a missão. O jogador escolhe nave, piloto, planeta, equipamento e dificuldade, e cada escolha altera os dados usados na próxima etapa.

### 11. Fuga do Hiperespaço: relatório da missão

![Fuga do Hiperespaço - Relatório](prints/11-starwars-relatorio-missao.png)

O relatório da missão reúne dinamicamente as escolhas feitas pelo jogador. Ele apresenta atributos, efeitos da combinação, dificuldade e dados usados para preparar a partida antes do início da fuga.

### 12. Fuga do Hiperespaço: partida

![Fuga do Hiperespaço - Partida](prints/12-starwars-partida.png)

Durante a partida, a tela apresenta HUD com tempo, vidas, pontuação, cristais, desvios, colisões e dificuldade. Esse fluxo mostra atualização visual em tempo real, eventos de controle e lógica de jogo baseada no estado da missão.

### 13. Hall dos Campeões

![Hall dos Campeões](prints/13-ranking-geral.png.png)

O Hall dos Campeões centraliza o acesso aos rankings dos jogos. A tela usa cards para organizar os universos e permite consultar os resultados de cada desafio de forma visual e direta.

### 14. Ranking com dados

![Ranking com Dados](prints/14-ranking-dados.png)

Nesta tela, o ranking apresenta dados de desempenho dos jogadores separados por dificuldade. O sistema compara resultados usando critérios como tempo, erros, dicas ou pontuação, de acordo com a regra de cada jogo.

### 15. Ranking detalhado

![Ranking Detalhado](prints/15-ranking-dados2.png)

O ranking detalhado reforça a organização dos resultados e a comparação entre jogadores. Também mostra a opção de exportação, conectando os dados do ranking ao fluxo de envio por e-mail.

### 16. Página Sobre

![Página Sobre](prints/16-sobre.png)

A página Sobre apresenta a proposta do GeekVerse G8, as tecnologias utilizadas e os principais recursos do sistema. Ela funciona como uma documentação visual do projeto dentro da própria aplicação.

### 17. E-mail de resultado da partida

![E-mail de Resultado da Partida](prints/17-email-resultado-partida.png)

Este print comprova a integração com EmailJS para envio do resultado pessoal da partida. O e-mail apresenta informações como jogo, jogador, dificuldade, status, pontuação e resumo do desempenho.

### 18. E-mail de ranking

![E-mail de Ranking](prints/18-email-ranking.png)

O e-mail de ranking demonstra a exportação dos dados classificados. Esse recurso conecta o ranking da aplicação ao serviço de e-mail, permitindo compartilhar os resultados gerados pelo sistema.

### 19. E-mail do formulário de contato

![E-mail de Contato](prints/19-email-contato.png)

O formulário de contato utiliza campos controlados, evento de envio e integração com EmailJS. Esse fluxo permite que uma mensagem enviada pela interface seja encaminhada ao e-mail do projeto.

### 20. E-mail de auditoria

![E-mail de Auditoria](prints/20-email-auditoria.png)

O e-mail de auditoria registra eventos importantes da sessão, como login, acesso aos jogos, partidas iniciadas, partidas finalizadas e exportações. Esse recurso demonstra o acompanhamento das ações do usuário dentro do sistema.
