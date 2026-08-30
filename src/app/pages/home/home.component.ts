import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {CountriesService} from "../../services/countries.service";
import {CountryModel} from "../../models/country.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {


  public totalCountries = 0;
  public totalJOs = 0;
  public error = '';

  public countries: string[] = [];
  public medalsPerCountry: number[] = [];

  constructor(private router: Router, private countriesService: CountriesService) {}

  ngOnInit(): void {
    this.countriesService.getCountries().subscribe({
      next: (data: CountryModel[]) => this.handleData(data),
      error: () => (this.error = 'Une erreur est survenue lors du chargement des données.')
    });
  }

  private handleData(data: CountryModel[]): void {
    if (!data || data.length === 0) {
      return;
    }
    this.countries = data.map((c) => c.country);
    this.totalCountries = this.countriesService.getTotalCountries(data);
    this.totalJOs = this.countriesService.getTotalJOs(data);
    this.medalsPerCountry = this.countriesService.getMedalsPerCountry(data);
  }

  onCountryClick(countryName: string): void {
    this.router.navigate(['country', countryName]);
  }
}

