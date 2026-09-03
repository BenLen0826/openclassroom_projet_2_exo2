# TéléSport — Tableau de bord des Jeux Olympiques

Application Angular affichant les résultats (médailles, athlètes, éditions) des
pays aux Jeux Olympiques : une page d'accueil avec une vue d'ensemble et une page
de détail par pays.

Générée avec Angular CLI 18. Code entièrement **standalone** (aucun `NgModule`),
état géré avec les **signaux** Angular, graphiques via **Chart.js**.

## Prérequis

- Node.js 18+ et npm
- Installer les dépendances avant tout : `npm install`

## Commandes

| Commande | Effet |
|----------|-------|
| `npm start` (`ng serve`) | Serveur de dev sur `http://localhost:4200/`, rechargement automatique. |
| `npm run build` (`ng build`) | Build de production dans `dist/`. |
| `npm test` (`ng test`) | Tests unitaires (Karma/Jasmine). Nécessite un navigateur Chrome/Chromium. |

## Architecture

Le détail complet est dans **[`ARCHITECTURE.md`](ARCHITECTURE.md)** ; l'analyse du
code de départ et les choix de refonte sont dans
[`src/app/notes-architecture.md`](src/app/notes-architecture.md).

En résumé, sous `src/app/` :

- **`components/`** — composants présentationnels réutilisables (`header`,
  `page-title`, `card`, `chart`). Entrées/sorties via `input()` / `output()`,
  aucune injection de service.
- **`pages/`** — composants routés (`home`, `country`, `not-found`) déclarés dans
  `app.routes.ts` ; ils injectent le service, portent l'état en signaux et
  dérivent l'affichage via `computed`.
- **`services/`** — `data.service.ts` : point d'accès unique aux données, méthodes
  `getCountries()` / `getCountryByName()` renvoyant des `Observable`.
  `countries.service.ts` est conservé comme variante `HttpClient` (non branchée).
- **`models/`** — interfaces TypeScript : `CountryModel`, `ParticipationModel`,
  `ChartConfig`.

Démarrage : `main.ts` → `bootstrapApplication(AppComponent, appConfig)` ;
providers dans `app.config.ts` (`provideRouter`, `provideHttpClient`).

## Données

Le service actif (`DataService`) sert un jeu de données statique embarqué (issu de
`src/assets/mock/olympic.json`). L'URL de la source est externalisée dans
`src/environments/environment.ts` (`olympicUrl`), utilisée par
`countries.service.ts` qui reflete le service actif via un fonctionnement utilisant une api : pointer vers une véritable API ne demande que de changer
cette valeur et de reproduire le fonctionnement de `countries.service.ts` , sans toucher aux composants.
