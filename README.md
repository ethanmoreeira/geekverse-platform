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

Os créditos adicionais de áudio e recursos visuais estão documentados no arquivo `CREDITOS_AUDIO.md`, se aplicável.



