# Architecture — TéléSport / Olympic Games

Dashboard Angular affichant les médailles olympiques par pays.
Ce document décrit la structure des dossiers, les composants et le service.
Les constats qui ont mené à cette organisation sont consignés dans
[`src/app/notes-architecture.md`](src/app/notes-architecture.md).

## Stack & conventions

- **Angular 18, 100 % standalone** : pas de `NgModule`, démarrage via
  `bootstrapApplication` (`src/main.ts` + `src/app/app.config.ts`).
- **Signaux** pour l'état local : `signal`, `computed`, `effect` ; entrées/sorties
  de composant via `input()` / `output()`.
- **Désabonnement automatique** via `takeUntilDestroyed`.
- **Graphiques** : Chart.js encapsulé dans un composant dédié (aucun couplage à un id du DOM).
- **Accès données** : un seul service (`DataService`) qui charge le JSON via
  `HttpClient` et met le résultat en cache mémoire.
- **Accessibilité** : contrastes AA, focus visibles, `aria-label` sur les
  boutons/icônes, descriptions textuelles pour les graphiques.

## Arborescence

```
src/
├── main.ts                        # bootstrapApplication(AppComponent, appConfig)
├── environments/                  # environment.ts / environment.prod.ts — olympicUrl (futur : URL d'API)
├── assets/
│   └── mock/olympic.json          # jeu de données, chargé par data.service.ts via environment.olympicUrl
└── app/
    ├── app.component.ts           # composant d'origine affichant le header et le router outlet : <app-header> + <router-outlet>
    ├── app.config.ts              # providers : provideRouter, provideHttpClient
    ├── app.routes.ts              # table de routage des composants "pages"
    │
    ├── components/                # composants présentationnels (dumb), réutilisables
    │   ├── header/                # en-tête global de l'application
    │   ├── page-header/           # titre de page + liste de stats (inputs : title, stats)
    │   ├── stat-card/             # carte statistique          (inputs : label, value)
    │   ├── stat-list/             # rend une stat-card par entrée (input : stats)
    │   ├── chart/                 # wrapper Chart.js           (input : config, output : sliceClick)
    │   └── back-button/           # lien de retour stylé en bouton (inputs : label, ariaLabel, route)
    │
    ├── pages/                     # composants routés (smart / conteneurs)
    │   ├── home/                  # tableau de bord : médailles par pays
    │   ├── country/               # détail d'un pays
    │   └── not-found/             # page 404
    │
    ├── services/
    │   └── data.service.ts        # point d'accès unique aux données (HttpClient + cache)
    │
    └── models/
        ├── country.model.ts       # CountryModel
        ├── participation.model.ts # ParticipationModel
        ├── stat.model.ts          # StatModel (contrat des cartes de statistiques)
        └── chart-config.ts        # ChartConfig (contrat d'entrée de ChartComponent)
```

Chaque dossier de composant contient `.ts` / `.html` / `.scss` (+ `.spec.ts`, non
exécuté ici faute de navigateur ; validation par `ng build`).

## Composants

### `pages/` — composants routés (smart)

Déclarés dans `app.routes.ts`. Ils injectent le service et le `Router`, portent
l'état dans des signaux, et dérivent les données d'affichage via `computed`
(nombre de médailles, de pays, d'éditions…). Ils ne contiennent pas de HTML de
présentation réutilisable : c'est délégué aux composants de `components/`.

| Page | Route | Rôle |
|------|-------|------|
| `HomeComponent` | `''` | Récupère tous les pays via `DataService.getCountries()`. Dérive le nombre de pays, le nombre d'éditions des JO (`Set` d'années) et le total de médailles par pays. Affiche un camembert (`pie`) ; un clic sur une part navigue vers `country/:countryName`. |
| `CountryComponent` | `country/:countryName` | Lit le paramètre de route, récupère la liste via `DataService.getCountries()` puis sélectionne le pays avec `map` + `find`. Dérive nombre de participations, total de médailles, total d'athlètes, années et médailles par année. Affiche une courbe (`line`). Redirige vers `not-found` si le pays est inconnu. |
| `NotFoundComponent` | `not-found`, `**` | Page 404 statique, retour à l'accueil via `back-button`. |

### `components/` — composants présentationnels (dumb)

Uniquement de la présentation de données. Aucune injection de service, aucune
connaissance du routing. Entrées via `input()`, sorties via `output()`.
Réutilisables sur n'importe quelle page.

| Composant | API | Rôle |
|-----------|-----|------|
| `HeaderComponent` | — | En-tête global, rendu par `AppComponent` au-dessus du `router-outlet`. |
| `PageHeaderComponent` | `title: string`, `stats: StatModel[]` | Affiche le titre de la page puis délègue les statistiques à `StatListComponent`. |
| `StatListComponent` | `stats: StatModel[]` | Rend une `StatCardComponent` par entrée (`@for`, `track stat.label`). |
| `StatCardComponent` | `label: string`, `value: string \| number` | Affiche une statistique (libellé + valeur) sous forme de carte. |
| `ChartComponent` | `config: ChartConfig` (requis), `sliceClick: output<string>()` | Encapsule Chart.js. Un `effect()` (re)construit le graphique quand `config` change et le détruit au nettoyage. Émet le libellé de l'élément cliqué via `sliceClick`. |
| `BackButtonComponent` | `label: string`, `ariaLabel: string`, `route: string` | Contrôle de retour factorisé. Rendu comme un `<a routerLink>` (sémantique de navigation) stylé en bouton : contraste AA, `:focus-visible` visible, `aria-label`. |

`AppComponent` est le point d'entrée visuel : il assemble `HeaderComponent` et le
`router-outlet`, sans logique propre.

## Le service

### `DataService` — `services/data.service.ts` (`providedIn: 'root'`, singleton)

Point d'accès **unique** aux données. Les composants ne connaissent que sa
méthode publique ; ils ne manipulent jamais la source directement.

- `private readonly http = inject(HttpClient)` et `olympicUrl = environment.olympicUrl`.
- `private dataCountries?: CountryModel[]` — cache mémoire du jeu de données.
- `getCountries(): Observable<CountryModel[]>` :
  - premier appel — `http.get<CountryModel[]>(olympicUrl)` → `map` (tri par
    `country.localeCompare`) → `tap` (mise en cache) ;
  - appels suivants — `of(this.dataCountries)`, sans requête réseau.

La sélection d'un pays précis n'est pas dans le service : `CountryComponent`
filtre lui-même la liste (`map` + `find` sur le nom). Le retour est typé
**`Observable`** (et non un tableau nu) : choix volontaire qui absorbe la latence
réseau d'une future API.

## Préparation à une connexion back-end / API

Le service consomme déjà `HttpClient` sur une URL externalisée : passer à une API
réelle **ne modifie qu'un fichier**, voire aucune ligne de code.

1. **Le contrat est l'interface du service, pas la source.** Les composants
   appellent `getCountries()` et s'abonnent au résultat. L'appel HTTP est déjà en
   place ; il n'y a rien à réécrire côté composants.
2. **Le type `Observable` absorbe déjà la latence réseau.** Les pages gèrent
   l'asynchrone de bout en bout : `subscribe`, signal `error` affiché dans le
   template (`@if (error())`), désabonnement via `takeUntilDestroyed`.
3. **Les modèles figent la forme des données.** `CountryModel` /
   `ParticipationModel` servent de schéma attendu de l'API. Si la réponse diffère,
   l'adaptation se fait dans le service via un `map()`, sans impact sur les composants.
4. **L'infrastructure HTTP est déjà en place.** `provideHttpClient()` est
   enregistré dans `app.config.ts` ; une base URL, des intercepteurs
   (authentification, gestion d'erreurs centralisée) s'ajoutent ici, de façon
   transversale. Un cache mémoire simple est déjà présent dans `getCountries()`.
5. **L'URL de la source est déjà externalisée.** `environment.ts` /
   `environment.prod.ts` exposent `olympicUrl` (aujourd'hui
   `./assets/mock/olympic.json`). Pointer vers une API réelle = changer cette
   seule valeur par environnement (dev vs prod).
