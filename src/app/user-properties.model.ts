import { CalcSettings } from './calc-settings/calc-settings.model';

//This will store userSelected properties into a DB. Will GET at initial login, and update settings
export interface UserSettings {
                                account: AccountDetails,

                                preferences: {  userPrefferedStakes: CalcSettings[];
                                                ftaOption: string;
                                                exchangeOption: { name:string, commission: number}
                                             },

                                filters:     {  viewTable: TablePreferences; },
                              }

export interface AccountDetails{
  username:string;
  firstName: string;
  lastName: string;
  email: string;
  quote: string;
}

export interface TablePreferences {
  leagueSelection: string[];
  timeRange: string;
  minOdds: string;
  maxOdds: string;
  evFilterValueI: string;
  evFilterValueII:string;
  matchRatingFilterI:string;
  matchRatingFilterII: string;
  secretSauceI:string;
  secretSauceII:string;
  isEvSelected: string;
  dialogDisabled: boolean;
  audioEnabled: boolean;
}
