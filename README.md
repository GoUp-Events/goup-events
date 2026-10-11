# GoUp Events

Frontend React, TypeScript e Vite da plataforma de descoberta de eventos GoUp.

## Desenvolvimento

Instale as dependências do `bun.lock` e execute `npm run dev -- --host localhost --port 5173` (ou `bun run dev -- --host localhost --port 5173`). Essa origem já é aceita pelo CORS padrão do backend; a porta 8080 usada pelo Vite neste projeto não é aceita no Railway sem ajustar `GOUP_CORS_ORIGINS`. O servidor local usa a API publicada por padrão. Para apontar a outra instância, copie `.env.example` para `.env.local` e defina `VITE_API_BASE_URL` com a URL pública do backend, sem barra final.

O frontend usa diretamente os endpoints REST do backend. `GET /events` aceita `q`, `city`, `categoryId`, `categoryIds`, `dateFrom`, `dateTo`, `maxPrice`, `freeOnly`, `ageRating` e `sort`; os filtros da página de eventos ficam na URL. O formulário usa `GET /locations/autocomplete?q=...` com JWT e envia somente o `placeId` escolhido no POST/PUT de eventos. As categorias vêm de `GET /categories`.

## Variáveis de ambiente

| Ambiente                    | Variável                                                                | Finalidade                                                                                     |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Frontend (local ou Lovable) | `VITE_API_BASE_URL`                                                     | URL pública da API. Opcional; padrão: `https://goup-events-backend-production.up.railway.app`. |
| Backend (Railway)           | `GOOGLE_PLACES_API_KEY`                                                 | Chave da Places API (New), usada pelo autocomplete e pela resolução dos locais.                |
| Backend (Railway)           | `GOUP_CORS_ORIGINS`                                                     | Origens permitidas para o frontend. Inclua a origem local se usar outra porta.                 |
| Backend (Railway)           | `GOUP_JWT_SECRET`                                                       | Segredo do JWT.                                                                                |
| Backend (Railway)           | `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` | Banco MySQL.                                                                                   |
| Backend (Railway)           | `GEMINI_API_KEY`                                                        | Descoberta Mágica, quando usada.                                                               |

A chave do Google fica somente no backend. Não configure variáveis `VITE_` com segredos.

## Verificação

Execute `npm run lint` e `npm run build`. Para testar o fluxo, entre na conta, abra **Criar evento**, digite pelo menos três caracteres do nome do local, escolha uma sugestão, preencha os demais campos e salve. Em **Explorar eventos**, combine cidade, categoria, datas e demais filtros; copie a URL e confira que ela reabre a mesma pesquisa.
