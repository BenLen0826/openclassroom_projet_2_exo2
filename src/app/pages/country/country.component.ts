import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CountriesService} from "../../services/countries.service";
import {CountryModel} from "../../models/country.model";


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {

  public titlePage = '';
  public totalEntries = 0;
  public totalMedals = 0;
  public totalAthletes = 0;
  public error = '';

  public years: string[] = [];
  public medalsPerYear: number[] = [];

  constructor(private route: ActivatedRoute, private countriesService: CountriesService, private router: Router) {}

  ngOnInit(): void {
    const countryName = this.route.snapshot.paramMap.get('countryName') ?? '';

    this.countriesService.getCountryByName(countryName).subscribe({
      next: (country) => this.handleData(country),
      error: () => (this.error = 'Une erreur est survenue lors du chargement des données.')
    });
  }

  private handleData(country: CountryModel | undefined): void {
    if (!country) {
      this.router.navigate(['not-found']);
      return;
    }

    this.titlePage = country.country;
    this.totalEntries = country.participations.length;
    this.years = country.participations.map((p) => p.year.toString());
    this.medalsPerYear = country.participations.map((p) => p.medalsCount);
    this.totalMedals = this.countriesService.getTotalMedalsForCountry(country);
    this.totalAthletes = this.countriesService.getTotalAthletesForCountry(country);
  }
}
