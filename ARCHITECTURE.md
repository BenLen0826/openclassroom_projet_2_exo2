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

## Arborescence

```
src/
├── main.ts                        # bootstrapApplication(AppComponent, appConfig)
├── environments/                  # environment.ts / environment.prod.ts (futur : URL d'API)
├── assets/
│   └── mock/olympic.json          # jeu de données d'origine (lu par countries.service.ts via l'environnement mais copier en brut dans countries.service.ts)
└── app/
    ├── app.component.ts           # composant d'origine affichant le header et le router outlet : <app-header> + <router-outlet>
    ├── app.config.ts              # providers : provideRouter, provideHttpClient
    ├── app.routes.ts              # table de routage pour les composants dits "pages"
    │
    ├── components/                # composants présentationnels (dumb), réutilisables
    │   ├── header/                # en-tête global de l'application
    │   ├── page-title/            # titre de page          (input : title)
    │   ├── card/                  # carte statistique      (inputs : label, value)
    │   └── chart/                 # wrapper Chart.js       (input : config, output : sliceClick)
    │
    ├── pages/                     # composants routés (smart / conteneurs)
    │   ├── home/                  # tableau de bord : médailles par pays
    │   ├── country/              # détail d'un pays
    │   └── not-found/             # page 404
    │
    ├── services/
    │   ├── data.service.ts        # service actif : données statiques exposées en Observable
    │   └── countries.service.ts   # variante conservée : HttpClient + olympic.json (non branchée)
    │
    └── models/
        ├── country.model.ts       # CountryModel
        ├── participation.model.ts # ParticipationModel
        └── chart-config.ts        # ChartConfig (contrat d'entrée de ChartComponent)
```

Chaque dossier de composant contient `.ts` / `.html` / `.scss` (+ `.spec.ts` dont test auto non effectué).

## Composants

### `pages/` — composants routés (smart)

Déclarés dans `app.routes.ts`. Ils injectent le service et le `Router`, portent
l'état dans des signaux, et dérivent les données d'affichage via `computed`
(nombre de médailles, de pays, d'éditions…). Ils ne contiennent pas de HTML de
présentation réutilisable : c'est délégué aux composants de `components/`.

| Page | Route | Rôle |
|------|-------|------|
| `HomeComponent` | `''` | Récupère tous les pays via `DataService.getCountries()`. Dérive le nombre de pays, le nombre d'éditions des JO et le total de médailles par pays. Affiche un camembert (`pie`) ; un clic sur une part navigue vers `country/:countryName`. |
| `CountryComponent` | `country/:countryName` | Lit le paramètre de route, récupère le pays via `DataService.getCountryByName()`. Dérive nombre de participations, total de médailles, total d'athlètes, années et médailles par année. Affiche une courbe (`line`). Redirige vers `not-found` si le pays est inconnu. |
| `NotFoundComponent` | `not-found`, `**` | Page 404 statique avec lien de retour à l'accueil. |

### `components/` — composants présentationnels (dumb)

Ils ne sont utilisés uniquement que pour la présentation de données. Aucune injection de service, aucune connaissance du routing. Entrées via `input()`,
sorties via `output()`. Réutilisables sur n'importe quelle page.

| Composant | API | Rôle                                                                                                                                                                 |
|-----------|-----|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HeaderComponent` | — | En-tête global, rendu par `AppComponent` au-dessus du `router-outlet`.                                                                                               |
| `PageTitleComponent` | `title: string` | Affiche le titre d'une page de façon homogène entre les vues.                                                                                                        |
| `CardComponent` | `label: string`, `value: string \| number` | Affiche une statistique (libellé + valeur) sous forme de carte (card).                                                                                               |
| `ChartComponent` | `config: ChartConfig` (requis), `sliceClick: output<string>()` | Encapsule Chart.js. Un `effect()` (re)construit le graphique quand `config` change et le détruit au nettoyage. Émet le libellé de l'élément cliqué via `sliceClick`. |

`AppComponent` est le point d'entrée visuel : il assemble `HeaderComponent` et le
`router-outlet`, sans logique propre.

## Le service

### `DataService` — `services/data.service.ts` (`providedIn: 'root'`, singleton)

Point d'accès **unique** aux données. Les composants ne connaissent que ses
méthodes ; ils ne manipulent jamais la source directement.

- `private readonly countries: CountryModel[]` — jeu de données statique embarqué
  (5 pays), recopié depuis `assets/mock/olympic.json`.
- `getCountries(): Observable<CountryModel[]>` — renvoie l'ensemble des pays (`of(this.countries)`).
- `getCountryByName(name): Observable<CountryModel | undefined>` — dérive de
  `getCountries()` via `map` + `find`.

Le retour est typé **`Observable`** (et non un tableau nu) : choix volontaire qui
prépare le branchement d'une API (voir section suivante).

### `CountriesService` — `services/countries.service.ts`

Conservé comme **référence de la variante HTTP** : même API publique, mais les
données sont chargées via `HttpClient` depuis l'URL `environment.olympicUrl`
(`./assets/mock/olympic.json`), puis mises en cache en mémoire. Non injecté dans
l'application actuelle.

## Préparation à une connexion back-end / API

L'architecture est pensée pour que le passage à une API réelle **ne modifie qu'un
seul fichier** : `data.service.ts`.

1. **Le contrat est l'interface du service, pas la source.** Les composants
   appellent `getCountries()` / `getCountryByName()` et s'abonnent au résultat.
   Remplacer `return of(this.countries)` par
   `return this.http.get<CountryModel[]>(environment.olympicUrl)`
   suffit — aucun composant à toucher. `countries.service.ts` montre déjà cette
   implémentation.
2. **Le type `Observable` absorbe déjà la latence réseau.** Les pages gèrent
   l'asynchrone de bout en bout : `subscribe`, signal `error` affiché dans le
   template (`@if (error())`), désabonnement via `takeUntilDestroyed`.
3. **Les modèles figent la forme des données.** `CountryModel` /
   `ParticipationModel` servent de schéma attendu de l'API. Si la réponse diffère,
   l'adaptation se fait dans le service via un `map()`, sans impact sur les composants.
4. **L'infrastructure HTTP est déjà en place.** `provideHttpClient()` est
   enregistré dans `app.config.ts` ; une base URL, des intercepteurs
   (authentification, gestion d'erreurs centralisée) ou un cache s'ajoutent ici,
   de façon transversale.
5. **L'URL de la source est déjà externalisée.** `environment.ts` /
   `environment.prod.ts` exposent `olympicUrl` (aujourd'hui
   `./assets/mock/olympic.json`, consommé par `countries.service.ts`). Pointer
   vers une API réelle = changer cette seule valeur par environnement (dev vs prod).
