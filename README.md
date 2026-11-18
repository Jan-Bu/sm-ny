# Směny

Produkční základ české aplikace pro plánování směn. Obsahuje responzivní týdenní rozpis, segmentované směny, kontrolu obsazení, koncepty/publikaci, PostgreSQL model, bezpečnostní API základ a doménové testy.

## Stack

React 19, Vite 7, TypeScript strict, Express 5, Prisma 6, PostgreSQL 17, Zod, Vitest. Časové údaje se ukládají jako UTC a zobrazují v `Europe/Prague`.

## Spuštění

1. `Copy-Item .env.example .env` a změňte `SESSION_SECRET`.
2. `docker compose up -d`
3. `npm install`
4. `npm run db:generate && npm run db:migrate && npm run db:seed`
5. `npm run dev`

Frontend poběží na http://localhost:5173, API na portu 3001.

## Kontroly

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Bezpečnost a nasazení

V produkci použijte silný náhodný `SESSION_SECRET`, HTTPS reverse proxy, spravovanou PostgreSQL se zálohami a e-mailový adaptér. Nikdy nepoužívejte demo hesla. Databázi zálohujte pomocí `pg_dump`; obnovte přes `pg_restore`. Účet hlavního správce vytvořte seedem pouze lokálně nebo bezpečným jednorázovým administrativním příkazem. OAuth vyžaduje vlastní klientské údaje a není bez nich aktivní.

## Známá omezení

Dodaná verze obsahuje kompletní interaktivní plánovací jádro a normalizovaný datový model. Externí e-mail, OAuth a právní kontroly jsou integrační body; bez tajných klíčů zůstávají vypnuté. Varování jsou provozní, nikoli pracovněprávní poradenství.
