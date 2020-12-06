import { TriggerOdds } from './match-notification-settings/trigger-odds.model';
import { CalcSettings } from './calc-settings/calc-settings.model';

//This will store userSelected properties into a DB. Will GET at initial login, and update settings
export interface UserProperties
{
  //for user login credentials
  // credentials: {
  //   username: string,
  //   password: string
  // },

  //for calc-settings component
  calcPref:  {
    userStakes: CalcSettings[],
    defaultStakes: CalcSettings[],
    oddsRange: string[];
  },

  //for match-notification-settings components
  notifPref: {
    triggerOdds: TriggerOdds[],
    defaultTriggers: TriggerOdds[],
  },

  //for ViewTable Settings
  viewTablePref: {
    leagueSelection: string[];
    timeRange: string;
    minOdds: string;
    maxOdds: string;
    evFilterValue: string;
  },
}
