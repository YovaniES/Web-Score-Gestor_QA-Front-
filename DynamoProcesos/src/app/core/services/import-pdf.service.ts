import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IMPORT_PDF_SCORE } from '../constants/url.constants';
import { Evidencias } from '../models/archivo-pdf';
import { Status } from '../models/status';

@Injectable({
  providedIn: 'root',
})
export class PdfImportService {

  constructor(private http: HttpClient) {}

    addPdf(data: Evidencias){
      console.log('DATA', data);

      const formData: FormData = new FormData();

      formData.append('NombreEvidencia', data.nombreEvidencia);
      formData.append('ArchivoPdf', data.archivoPdf??'');

      return this.http.post<Status> (API_IMPORT_PDF_SCORE+'/AddPdf', formData);
    }


    getAllPdf(){
      return this.http.get<Evidencias[]>(API_IMPORT_PDF_SCORE+'/getall')
    }
}
