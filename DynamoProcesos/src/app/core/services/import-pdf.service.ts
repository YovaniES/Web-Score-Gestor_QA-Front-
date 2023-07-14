import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IMPORT_PDF_SCORE } from '../constants/url.constants';
import { Evidencias, UserJira } from '../models/archivo-pdf';
import { Status } from '../models/status';
import { FnParam } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root',
})
export class PdfImportService {

  constructor(private http: HttpClient) {}

    addPdf(data: Evidencias){
      console.log('DATA', data);
      const formData: FormData = new FormData();
1
      formData.append('nombre'   , data.nombre);
      formData.append('archivo'  , data.archivo??"");
      formData.append('idScore_m', data.idScore_m);

      return this.http.post<Status> (API_IMPORT_PDF_SCORE+'/add_pdf', formData);
    }

    getAllPdf(){
      return this.http.get<Evidencias[]>(API_IMPORT_PDF_SCORE+'/get_all')
    }

    postListJira(user: UserJira){
      return this.http.post<any>(this.apiJira, user )
    }

    descargarPdf(id: number){
      return this.http.get<any>(API_IMPORT_PDF_SCORE+'/descargar/', {
        params:{
          id: id
        }
      })
    }

    apiJira: string = 'https://mindmessagebrokerpre.indra.es/proxy/jira/rest/api/2/issue/TESTSS-16993';
    getAllListJira(username: string, password: string){
      let authorizationData = 'Basic ' + btoa(username + ':' + password);
        // let authorizationData = "Basic " + window.btoa('astsusuariointegrador:MINDintegrador')

      const headerOptions: any = {
        headers: new HttpHeaders({
          'Content-Type' : 'application/json',
          'Authorization': authorizationData
          })
        }
          return this.http.get<any[]>(this.apiJira, headerOptions);
        }
  }
