# GoUp Events
 
**Descubra o que fazer hoje.** O GoUp é uma plataforma de descoberta e divulgação de eventos e lazer em **Blumenau e região**: você encontra o que fazer, publica eventos, favorita o que quer ir e recebe sugestões de uma IA que só recomenda eventos reais cadastrados.
 
[![Acessar o site](https://img.shields.io/badge/🌐_Acessar_o_site-goup--events.lovable.app-F03D82?style=for-the-badge&labelColor=F03D82)](https://goup-events.lovable.app/)
[![Ver apresentação](https://img.shields.io/badge/▶_Ver_apresentação-vídeo_no_Canva-FFC931?style=for-the-badge&labelColor=FFC931)](https://www.canva.com/design/DAHX2qmXIfg/iP8ib-kSzZ0Wc9pcD6Ilzw/watch?utm_content=DAHX2qmXIfg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3f037128cc)
 
> **Não precisa instalar nada.** O site e a API (back-end) já estão publicados: é só abrir o link acima no navegador, no computador ou no celular.
 
---
 
## Como acessar e testar
 
1. Abra **[goup-events.lovable.app](https://goup-events.lovable.app/)**.
2. Sem criar conta, você já pode **explorar eventos** e ver os detalhes de cada um.
3. Clique em **Cadastro** para criar sua conta (ou em **Login**, se já tiver uma).
4. Depois de entrar, você pode:
   - **Explorar eventos** com busca por texto, cidade, categoria, datas, preço, "só gratuitos" e classificação etária. Os filtros ficam na URL: copie o link e ele reabre a mesma pesquisa.
   - Abrir um evento para ver **estabelecimentos próximos** (restaurantes, bares, cafés, parques...) com distância, preço e avaliação.
   - **Favoritar** eventos e consultá-los em **Favoritos**.
   - Ver os eventos no **Mapa** interativo.
   - **Criar, editar e excluir** seus próprios eventos em **Meus eventos**. No formulário, o local é escolhido por autocomplete (Google Places).
   - Conhecer os **planos** em **Planos**.
> Se a API demorar a responder, algumas telas podem mostrar uma mensagem de erro. Aguarde alguns instantes e tente novamente.
 
## Planos Free e Premium
 
| Recurso                                                   |  Free  | Premium |
| --------------------------------------------------------- | :----: | :-----: |
| Descoberta, pesquisa e filtros de eventos                 |   ✅   |   ✅    |
| Favoritos, criar e gerenciar seus eventos                 |   ✅   |   ✅    |
| Estabelecimentos próximos do evento                       | até 3  | até 10  |
| Filtro dos próximos por tipo de lugar                     |   —    |   ✅    |
| Ordenar eventos por **mais populares**                    |   —    |   ✅    |
| **Descoberta Mágica** (chatbot com IA)                    |   —    |   ✅    |
| **Recomendações personalizadas** (a partir dos favoritos) |   —    |   ✅    |
 
- **A assinatura é demonstrativa.** Não há pagamento real e nenhum dado financeiro é coletado ou salvo.
- O plano é um atributo do usuário (`premium`) definido pela equipe no banco de dados.
- As regras são validadas **no back-end**: o front apenas mostra ou esconde botões. Quem tenta usar um recurso Premium no plano Free recebe uma resposta de acesso negado da API.
### Descoberta Mágica
 
O usuário descreve o que quer fazer (por exemplo, "algo pra fazer sábado com cerveja"). O back-end separa eventos reais, publicados e futuros, e a IA (Gemini) escolhe entre eles. Qualquer sugestão fora dessa lista é descartada, então a IA não inventa eventos, datas, preços ou locais.
 
---
 
## Tecnologias
 
| Parte      | Tecnologia                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Front-end  | React 19, TypeScript, TanStack Start/Router, TanStack Query, Vite, Tailwind CSS 4, MapLibre GL, Vitest  |
| Back-end   | Java 21, Spring Boot, MySQL, Spring Security com JWT, Google Places API, Gemini API                     |
 
Este repositório é o **front-end**. O back-end está em [GoUp-Events/GoUp-Events-Backend](https://github.com/GoUp-Events/GoUp-Events-Backend).
 
---
 
## Para desenvolvedores (opcional)
 
Só é necessário se você quiser rodar o código na sua máquina. Para apenas usar o GoUp, ignore esta seção.
 
<details>
<summary><b>Rodar o front-end localmente</b></summary>
<br>
Pré-requisito: [Bun](https://bun.sh/) ou Node.js com npm.
 
```bash
bun install
bun run dev -- --host localhost --port 5173
# ou, com npm:
npm install
npm run dev -- --host localhost --port 5173
```
 
Acesse `http://localhost:5173`. Use a porta **5173**: essa origem já é aceita pelo CORS padrão do back-end. A porta 8080 não é aceita no Railway sem ajustar `GOUP_CORS_ORIGINS`.
 
Por padrão o front usa a API publicada. Para apontar para outra instância (por exemplo, o back-end na sua máquina), copie `.env.example` para `.env.local` e defina, sem barra no final:
 
```env
VITE_API_BASE_URL=http://localhost:8080
```
 
| Comando           | O que faz                     |
| ----------------- | ----------------------------- |
| `npm run dev`     | Servidor de desenvolvimento   |
| `npm run build`   | Gera a versão de produção     |
| `npm run preview` | Visualiza o build localmente  |
| `npm run lint`    | Verifica o código com ESLint  |
| `npm run format`  | Formata o código com Prettier |
| `npm run test`    | Executa os testes             |
 
</details>
<details>
<summary><b>Estrutura do projeto</b></summary>
<br>
```
src/
├── routes/            # Páginas (uma por arquivo): eventos, mapa, favoritos, planos, descoberta...
├── components/
│   ├── goup/          # Componentes do GoUp (explorar, detalhes, formulário, mapa, planos...)
│   └── ui/            # Componentes de interface reutilizáveis
├── lib/
│   ├── api.ts         # Todas as chamadas REST ao back-end
│   └── models.ts      # Tipos compartilhados da API
├── config.ts          # URL base da API
└── test/              # Testes
```
 
</details>
<details>
<summary><b>Integração com a API</b></summary>
<br>
O front usa diretamente os endpoints REST do back-end, concentrados em `src/lib/api.ts`.
 
- `GET /events` aceita `q`, `city`, `categoryId`, `categoryIds`, `dateFrom`, `dateTo`, `maxPrice`, `freeOnly`, `ageRating` e `sort`. Os filtros da página de eventos ficam na URL.
- O formulário de evento usa `GET /locations/autocomplete?q=...` (com JWT) e envia apenas o `placeId` escolhido no `POST`/`PUT` de eventos.
- As categorias vêm de `GET /categories`.
- A autenticação usa JWT, enviado no header `Authorization: Bearer ...`. Se a API responde 401, o front limpa a sessão e avisa que ela expirou.
</details>
<details>
<summary><b>Variáveis de ambiente</b></summary>
<br>
| Ambiente                    | Variável                                                                | Finalidade                                                                                     |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Frontend (local ou Lovable) | `VITE_API_BASE_URL`                                                     | URL pública da API. Opcional; padrão: `https://goup-events-backend-production.up.railway.app`. |
| Backend (Railway)           | `GOOGLE_PLACES_API_KEY`                                                 | Chave da Places API (New), usada pelo autocomplete e pela resolução dos locais.                |
| Backend (Railway)           | `GOUP_CORS_ORIGINS`                                                     | Origens permitidas para o frontend. Inclua a origem local se usar outra porta.                 |
| Backend (Railway)           | `GOUP_JWT_SECRET`                                                       | Segredo do JWT.                                                                                |
| Backend (Railway)           | `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` | Banco MySQL.                                                                                   |
| Backend (Railway)           | `GEMINI_API_KEY`                                                        | Descoberta Mágica, quando usada.                                                               |
 
A chave do Google fica somente no back-end. **Nunca** configure variáveis `VITE_` com segredos: elas ficam visíveis no navegador.
 
</details>
<details>
<summary><b>Como testar o fluxo completo</b></summary>
<br>
Execute `npm run lint` e `npm run build`. Depois:
 
1. Entre na conta e abra **Criar evento**.
2. Digite pelo menos três caracteres do nome do local, escolha uma sugestão, preencha os demais campos e salve.
3. Em **Explorar eventos**, combine cidade, categoria, datas e demais filtros.
4. Copie a URL e confira que ela reabre a mesma pesquisa.
</details>
---
 
## Sobre
 
O GoUp **não** vende ingressos, **não** é uma rede social e **não** é um assistente de IA genérico. O foco é ajudar as pessoas a descobrir o que fazer em Blumenau e região.
 
Projeto desenvolvido para apresentação.
