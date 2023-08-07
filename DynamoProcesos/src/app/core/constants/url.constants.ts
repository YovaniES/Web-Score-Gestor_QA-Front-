const ENVIROMENT: string = 'PROD';

let PATH_API_SCORE  = '';
let API_SAVE_DATA_IMPORT = '';
let PATH_SCORE_AUTH = '';
let API_SEND_MAIL   = '';
let API_IMPORT_PDF  = '';

switch (ENVIROMENT) {
  case 'DEV':
    // PATH_SCORE_AUTH =  'http://localhost:3080/aut/seguridad';
    break;
  case 'QA':
    PATH_SCORE_AUTH = '';
    break;
  case 'PROD':
    PATH_SCORE_AUTH      = 'http://seguridadweb.indratools.com/aut/seguridad/'

    // API_SAVE_DATA_IMPORT  = 'https://localhost:7247/api/ScoreDetalle';
    API_SAVE_DATA_IMPORT = 'http://saveimporteddata.indratools.com/api/ScoreDetalle'

    // API_SEND_MAIL        = 'http://localhost:36449/api/Mail'
    API_SEND_MAIL        = 'http://senddatascorebyemail.indratools.com/api/Mail'

    API_IMPORT_PDF       = 'https://localhost:7174/api/score'
    // API_IMPORT_PDF       = 'http://saveimportpdfscore.indratools.com/api/score'

    // PATH_API_SCORE       = 'https://localhost:3061/api/configurador/';
    PATH_API_SCORE       = 'http://backwebprocesos.indratools.com/api/configurador/'
    break;
  default:
    break;
}

// LOGIN
export const API_AUTH_SESSION_SCORE = PATH_SCORE_AUTH + 'login';

// REGISTRO SCORE
export const API_SCORE = PATH_API_SCORE + 'ExecuteQuery';

// API guardar data importada
export const API_IMPORT_SCORE_DETALLE = API_SAVE_DATA_IMPORT;
export const API_SEND_MAIL_DATA       = API_SEND_MAIL;
export const API_IMPORT_PDF_SCORE     = API_IMPORT_PDF;
