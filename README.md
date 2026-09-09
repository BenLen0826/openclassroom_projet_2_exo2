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

| Commande | Effet                                                                                                 |
|----------|-------------------------------------------------------------------------------------------------------|
| `npm start` (`ng serve`) | Serveur de dev sur `http://localhost:4200/`, rechargement automatique.                                |
| `npm run build` (`ng build`) | Build de production dans `dist/`.                                                                     |
| `npm test` (`ng test`) | Tests unitaires (Karma/Jasmine). Nécessite un navigateur Chrome/Chromium (non requis pour ce projet). |

## Architecture

Le détail complet est dans **[`ARCHITECTURE.md`](ARCHITECTURE.md)** ; l'analyse du
code de départ et les choix de refonte sont dans
[`src/app/notes-architecture.md`](src/app/notes-architecture.md).

En résumé, sous `src/app/` :

- **`components/`** — composants présentationnels réutilisables (`header`,
  `page-header`, `stat-card`, `stat-list`, `chart`, `back-button`).
  Entrées/sorties via `input()` / `output()`, aucune injection de service.
- **`pages/`** — composants routés (`home`, `country`, `not-found`) déclarés dans
  `app.routes.ts` ; ils injectent le service, portent l'état en signaux et
  dérivent l'affichage via `computed`.
- **`services/`** — `data.service.ts` : point d'accès unique aux données. Méthode
  `getCountries()` renvoyant un `Observable<CountryModel[]>`, avec mise en cache
  après le premier chargement et tri par nom de pays. La page `country` filtre le
  pays voulu à partir de ce tableau.
- **`models/`** — interfaces TypeScript : `CountryModel`, `ParticipationModel`,
  `ChartConfig`, `StatModel`.

Routes (`app.routes.ts`) : `''` → `home`, `country/:countryName` → `country`,
`not-found` et `**` → `not-found`.

Démarrage : `main.ts` → `bootstrapApplication(AppComponent, appConfig)` ;
providers dans `app.config.ts` (`provideRouter`, `provideHttpClient`).

## Accessibilité

Contrastes AA, focus visibles, `aria-label` sur les boutons/icônes et
descriptions textuelles associées aux graphiques. Le contrôle de retour est
factorisé dans le composant `back-button` (rendu comme un lien routé, stylé en
bouton).

## Données

`DataService` charge un jeu de données statique via `HttpClient` depuis
`src/assets/mock/olympic.json`. L'URL de la source est externalisée dans
`src/environments/environment.ts` (`olympicUrl`) : pointer vers une véritable API
ne demande que de changer cette valeur, sans toucher aux composants ni au
service.
