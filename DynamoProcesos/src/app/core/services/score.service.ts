import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_SCORE } from '../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {

  constructor(private http: HttpClient) {}

  cargarOBuscarScoreM(obj: any) {
    return this.http.post(API_SCORE, obj);
  }

  getListEstScore(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  ListaHistoricoCambios(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  cargarOBuscarScoreDetalle(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  crearScore(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  listScoreM_ByID(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  actualizarScore_m(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  cambiarEstadoDetalleAobservado(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  cambiarEstadoDetalleAaprobado(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  cambiarEstadoDetalleAenviado(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getListEstado(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getListFormatoEnvio(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getListHorarioEnvio(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getListEstados(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  asignarComentarioScore_d(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  exportScoreDetalleMasivoOdiurno(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  listExportWL(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  exportScoreDetalleB2B(obj: any){
    return this.http.post(API_SCORE, obj);
  };

  crearObservacionMasiva(obj: any){
    return this.http.post(API_SCORE, obj);
  };

  aprobarSolicitud(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  actualizarComentarioScore_m(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  listaScoreDuplicados(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  finalizarSolicitud(obj: any){
    return this.http.post(API_SCORE, obj);
  };

  getTablasExport(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getCasosEspExport(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getWLexport(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getListTXexport(obj: any){
    return this.http.post(API_SCORE, obj);
  }


  getCasosEspExportDiurna(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  getCasosEspExportMasiva(obj: any){
    return this.http.post(API_SCORE, obj);
  }

}
