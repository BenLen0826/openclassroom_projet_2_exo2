import { ParticipationModel } from './participation.model';

export interface CountryModel {
  id: number;
  country: string;
  participations: ParticipationModel[];
}
