import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  /** Données statiques (anciennement chargées depuis `assets/mock/olympic.json`). */
  private readonly countries: CountryModel[] = [
    {
      id: 1,
      country: 'Italy',
      participations: [
        { id: 1, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
        { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 28, athleteCount: 375 },
        { id: 3, year: 2020, city: 'Tokyo', medalsCount: 40, athleteCount: 381 },
      ],
    },
    {
      id: 2,
      country: 'Spain',
      participations: [
        { id: 1, year: 2012, city: 'Londres', medalsCount: 20, athleteCount: 315 },
        { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 17, athleteCount: 312 },
        { id: 3, year: 2020, city: 'Tokyo', medalsCount: 17, athleteCount: 321 },
      ],
    },
    {
      id: 3,
      country: 'United States',
      participations: [
        { id: 1, year: 2012, city: 'Londres', medalsCount: 109, athleteCount: 610 },
        { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 123, athleteCount: 652 },
        { id: 3, year: 2020, city: 'Tokyo', medalsCount: 113, athleteCount: 626 },
      ],
    },
    {
      id: 4,
      country: 'Germany',
      participations: [
        { id: 1, year: 2012, city: 'Londres', medalsCount: 44, athleteCount: 425 },
        { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 44, athleteCount: 422 },
        { id: 3, year: 2020, city: 'Tokyo', medalsCount: 37, athleteCount: 425 },
      ],
    },
    {
      id: 5,
      country: 'France',
      participations: [
        { id: 1, year: 2012, city: 'Londres', medalsCount: 35, athleteCount: 423 },
        { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 45, athleteCount: 412 },
        { id: 3, year: 2020, city: 'Tokyo', medalsCount: 33, athleteCount: 403 },
      ],
    },
  ];

  getCountries(): Observable<CountryModel[]> {
    return of(this.countries);
  }

  getCountryByName(countryName: string): Observable<CountryModel | undefined> {
    return this.getCountries().pipe(
      map((countries: CountryModel[]) =>
        countries.find((country: CountryModel) => country.country === countryName),
      ),
    );
  }
}
