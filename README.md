# Home App — Dashboard familial

Application web de dashboard familial, responsive (ordinateur + mobile), thème dark, auto-hébergée en un seul conteneur sur **Coolify** (build Nixpacks à partir d'un dépôt GitHub).

## Stack

- **Next.js 14** (App Router) — frontend + backend dans un seul process
- **TypeScript**
- **Tailwind CSS** — thème dark (palette inspirée du design GitHub dark)
- **Drizzle ORM + better-sqlite3** — base embarquée (fichier unique, zéro service externe)
- **SWR** — synchronisation temps réel entre les membres (polling + mutations optimistes)

## Widgets

| Widget | Détails |
| --- | --- |
| Météo | Open-Meteo (gratuit, sans clé). Position configurable via `settings`. |
| Marchés | AlphaVantage (clé requise). Liste d'actions + cryptos configurable. |
| Carburant | `prix-carburants.gouv.fr` + géolocalisation navigateur + geocoding Open-Meteo. |
| Liste de courses | Catégories, articles, cases à cocher (sans grisage/barré), persistance SQLite. |
| Repas | Liste de repas à cocher/décocher, pré-remplie (seed) et modifiable (ajout/suppression). |
| Liens rapides | Favoris épinglés avec favicon, CRUD complet. |

## Lancer en local

```bash
npm install
cp .env.example .env.local   # renseigne ALPHAVANTAGE_API_KEY
npm run dev
```

Ouvre http://localhost:3000. La base SQLite est créée automatiquement dans `./data/app.db`.

## Déploiement sur Coolify (Nixpacks)

1. Pousse ce dépôt sur GitHub.
2. Dans Coolify, crée une ressource **Application** → *Dockerfile/Nixpacks* (Nixpacks détecte automatiquement Next.js).
3. Variables d'environnement :
   - `ALPHAVANTAGE_API_KEY` : ta clé AlphaVantage (obligatoire pour le widget Marchés).
   - `DATA_DIR=/data` (recommandé) : dossier de la base SQLite.
4. **Volume persistant (important)** : monte un volume sur `/data` pour ne pas perdre les données à chaque redéploiement.
5. Le port interne exposé est `3000`.

> Sans volume sur `/data`, la base (liste de courses, repas, liens, réglages) est recréée vide à chaque déploiement.

## Réglages (table `settings`)

Modifiables depuis l'UI (page Marchés → *Modifier*) :

- `stock_symbols` — tickers d'actions (ex. `AAPL,MSFT,NVDA,SPY,QQQ`)
- `crypto_symbols` — cryptos (ex. `BTC,ETH`)
- `weather_lat` / `weather_lon` — position météo (défaut : Neuilly-sur-Seine)
- `weather_city` — nom affiché (défaut : Neuilly-sur-Seine)

## Limite AlphaVantage (plan gratuit)

Le plan gratuit est limité à **25 requêtes/jour**. Le serveur met en cache les cours **15 minutes** et espace les appels d'environ 1 s. Réduis la liste de symboles si tu atteins la limite.

## Notes

La logique météo (icônes SVG animées) vit dans `lib/weather-icons.ts` et la page `/weather` ; la logique carburant (géolocalisation, API `prix-carburants.gouv.fr`) dans `lib/fuel.ts` et la page `/gas-station`.
