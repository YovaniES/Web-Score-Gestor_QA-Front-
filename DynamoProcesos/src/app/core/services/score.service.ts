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

  actualizarScore(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  actualizarScoreD(obj: any){
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

  getListEstadoDetalle(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  actualizarObservacion(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  exportScoreDetalleMasivo(obj: any){
    return this.http.post(API_SCORE, obj);
  }

  exportScoreDetalleIndividual(obj: any){
    return this.http.post(API_SCORE, obj);
  }


  exportScoreDetalleExcepcion(obj: any){
    return this.http.post(API_SCORE, obj);
  }
}
