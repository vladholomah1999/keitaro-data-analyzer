export interface KeitaroData {
  creativeId: string
  sub1: string
  country: string
  countryFlag?: string
  spend: number
  installs: number
  reg: number
  deposits: number
  cpaInstall: number
  cpaReg: number
  cpaDep: number
  crReg: number
  crDep: number
  date: string
}

export interface DailyData {
  date: string
  data: KeitaroData[]
}

export interface SpendData {
  [creativeId: string]: number
}

export interface CreativeHistoryData {
  creativeId: string
  dates: string[]
  data: KeitaroData[]
}
