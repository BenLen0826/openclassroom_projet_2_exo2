Remarque générales :

## Étape 1 — Analyse du code initial

### 1. Architecture et séparation des responsabilités

- Il n'existe aucun service : les composants (`HomeComponent`, `CountryComponent`) appellent
  directement `HttpClient` depuis leurs propres fichiers, et effectuent eux-mêmes les calculs
  et le filtrage des données (ex : `country.component.ts` ligne 27, `home.component.ts` ligne 22).
  C'est un anti-pattern : l'accès aux données et la logique métier devraient être isolés du composant.
- Il n'existe aucun modèle (`interface`/`class`) pour représenter les données : les données brutes
  sont manipulées directement dans les composants, ce qui les rend plus volumineux et responsables
  de bien plus que du simple affichage.
- Absence de titre/en-tête sur la page de détail d'un pays, contrairement à ce qu'on pourrait
  attendre d'une page cohérente avec le reste de l'application.

### 2. Typage TypeScript

- Le typage strict n'est pas respecté : plusieurs propriétés sont typées en `any`
  (ex : `totalEntries` dans `country.component.ts`).
- Plusieurs opérations de `map`/`reduce` sur des tableaux sont réalisées sans typer les éléments
  manipulés, ce qui prive le compilateur de toute vérification sur les champs utilisés.

### 3. Code mort / résidus de développement

- Présence de `console.log` oubliés dans `home.component.ts` (lignes 24 et 35).
- La classe `.heading`, présente dans `styles.scss`, n'est utilisée nulle part dans le code —
  possible résidu, ou classe destinée à un usage avec la librairie de graphique, à vérifier.
- `titlePage` dans `HomeComponent` est initialisée mais ne sert qu'à l'affichage d'un texte fixe :
  la propriété est superflue et le texte pourrait être écrit directement dans le template.

### 4. Gestion des erreurs et des cas limites

- L'erreur récupérée lors de l'appel HTTP est stockée dans une propriété du composant, mais n'est
  jamais exploitée côté template — l'utilisateur ne voit donc jamais qu'une erreur est survenue.
- Dans `country.component.ts`, `selectedCountry.country` est utilisé sans vérifier que
  `selectedCountry` existe, alors que le code vérifie bien sa valeur juste après pour accéder à
  `participations` — incohérence dans la gestion du cas où le pays n'est pas trouvé.

### 5. Erreurs ou maladresses de code

- Utilisation de `.pipe()` sans aucun opérateur à l'intérieur (`pipe().subscribe(...)`) — ligne
  morte, sans effet, à supprimer.

### 6. Duplication de code entre `HomeComponent` et `CountryComponent`

- La même propriété `olympicUrl` est déclarée dans les deux composants.
- La logique de récupération des données (appel HTTP, structure du `subscribe`) est quasiment
  identique dans les deux composants.
- La gestion de l'erreur lors de la récupération des données est dupliquée à l'identique.
- La fonction de construction du graphique ("chart") est dupliquée avec des variations mineures
  entre les deux composants → à extraire dans un composant dédié `ChartComponent`.
- L'affichage du titre de page suit exactement la même structure HTML dans les deux composants
  → candidat à l'extraction dans un composant réutilisable.

## Etape 2

### 1. Diagnostic

Les principaux problèmes structurels identifiés en Étape 1 proviennent d'une même cause :
la concentration des tâches (accès aux données, logique métier, affichage) dans les composants,
sans séparation des responsabilités. Une répartition claire est nécessaire :

- Les **services** doivent se charger de la récupération et du traitement des données.
- Les **modèles** doivent refléter la structure des données utilisées, et ne devraient être
  instanciés que par les services.
- Les **composants** doivent désormais faire appel aux services pour récupérer des données déjà
  prêtes à l'affichage, sans effectuer eux-mêmes de filtrage ou de calcul.
- 
### 2. Arborescence proposée

En se basant sur la structure de `olympic.json`, voici une structure possible :

src/app/
├── components/
│     ├── chart/
│     │     ├── chart.component.ts
│     │     ├── chart.component.html
│     │     └── chart.component.scss
│     ├── card/
│     │     ├── card.component.ts
│     │     ├── card.component.html
│     │     └── card.component.scss
│     ├── page-title/
│     │     ├── page-title.component.ts
│     │     ├── page-title.component.html
│     │     └── page-title.component.scss
│     └── header/
│           ├── header.component.ts
│           ├── header.component.html
│           └── header.component.scss
│
├── pages/
│     ├── home/
│     │     ├── home.component.ts
│     │     ├── home.component.html
│     │     └── home.component.scss
│     ├── country/
│     │     ├── country.component.ts
│     │     ├── country.component.html
│     │     └── country.component.scss
│     └── not-found/
│           ├── not-found.component.ts
│           ├── not-found.component.html
│           └── not-found.component.scss
│
│
├── services/
│      └── countries.service.ts
│
├── models/
│     ├── country.model.ts
│     └── participation.model.ts
...


### 3. Répartition des responsabilités

#### Services

- `countries.service.ts` contiendra la récupération des données depuis `olympic.json`, puis
  instanciera les données dans les modèles `country.model.ts` et `participation.model.ts`.
- Ses méthodes reproduiront la logique de filtrage et de calcul actuellement présente dans
  `CountryComponent` et `HomeComponent` (nombre de médailles, nombre de pays, nombre d'éditions
  des JO, etc.), afin que les composants n'aient plus à s'en charger.

#### Composants de pages (`pages/`)

- `HomeComponent` et `CountryComponent` appelleront directement les méthodes du service et
  recevront des données déjà filtrées/calculées, prêtes à être affichées dans leurs templates.

#### Composants réutilisables (`components/`)

- `ChartComponent` : affichera un diagramme (pie ou line) à partir de données génériques
  transmises par les deux pages, éliminant la duplication de la logique de construction du
  graphique identifiée en Étape 1.
- `CardComponent` : affichera une donnée sous forme de carte, avec un label et une valeur,
  réutilisable pour toutes les statistiques affichées (nombre de pays, nombre de médailles, etc.).
- `PageTitleComponent` : affichera le titre dynamique d'une page, éliminant la duplication
  du bloc de titre identifiée en Étape 1.
- `HeaderComponent` : affichera l'en-tête global de l'application, commun à toutes les pages.

