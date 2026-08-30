Remarque générales :

## Etape 1

Structure

- Ils n'y a pas de services donc les components font appels au données via HttpClient
  depuis leur fichiers respectifs et procèdent aussi aux calculs ou filtrage des données.(ex: country.component.ts ligne 27 ou dans home.component.ts ligne 22) c'est donc un anti-patern.

- Le typescript n'est pas respecté car on retrouve des propriétés en "any" (ex: totalEntries de country.component.ts) et du mapping de tableau réaliser sans s'assurer du type des éléments
- Il n'y a pas de models donc l'injection de données ce fait au sein du component au lieu que ce soit dans le service ce qui rend les fichiers encore plus volumineux
- Présence de console.log oublié dans home.component.ts -> ligne 24 et ligne 35
- Gestion de l'erreur est manquante : on récupère l'erreur mais on ne faire rien coté template ?
- Pas de présence de titre/header pour la page de détails d'un pays
- Duplication :
  - même propriété dans homeComponent et CountryComponent : olympicUrl
  - quasiment la même gestion de l'appel des donnée est présente dans les deux components
  - gestion de l'erreur lors la récupération de données
  - fonction de construction des "chart" -> faire un nouveau component ChartComponent ?
  - affichage du titre identique dans les deux composants des pages
- Quelques erreurs de code :
  - pipe().subscribe(...)
  - on accède selectedCountry.country mais on vérifie la valeur de selectedContry si on cherche à accéder partipations ?
  - .heading présent dans style.scss mais pas utilisé (peut etre dans la librairie du chart ?)
  - titlePage dans homeComponent est initialiser mais sert uniquement à l'affichage du titre donc on peut ce passer de la propriété
  
## Etape 2

Les gros problèmes structurels concerne la concentration des taches/metiers/logique dans les components une séparations et une assignation des responsabilités est à réalisé.
Les services sont eux qui doivent se charger des données
Les modèles doivent refléter la structure des données à utiliser et devraientt être instancié que par les services
Les components doivent maintenant faire appelle au service afin de récupérer les donnéer et directement les afficher sans faire d'action de filtrage

En se basant sur la structure de olympic.json voici une structure possible:

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


- countries.service.ts contiendra la récupération des données de olympic.json puis instancera les données dans les models country.model.ts et participation.model.ts.
Ses méthodes reproduira la logique de filtrage que l'on retrouve dans les components countryComponent et homeComponent initiaux.
Les nouveaux components (countryView et Home) appelerons ces méthodes directement et récupéreront une copie données filtrés selon leur besoin pour les afficher dans leur templates directement.
- ChartComponent se chargera d'afficher un diagramme selon les données génériques transmises dans les deux pages
- CardComponent pour afficher une donnée sous forme de carde avec un label et une valeur.

## Etape 3
