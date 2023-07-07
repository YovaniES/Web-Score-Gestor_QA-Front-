export interface Evidencias{
  id       : number,
  idScore_m: string,
  nombre   : string,
  imagen   : string,
  archivo? : File
}

export interface UserJira{
  Username: string,
  Password: string
}
