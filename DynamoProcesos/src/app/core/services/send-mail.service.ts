import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_SEND_MAIL_DATA } from '../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class SendMailService {
  constructor(private http: HttpClient) {}

  SendDataByEmail(data: FormData): Promise<any> {
    var requestOptions = {
      method: 'POST',
      body: data,
    };

    return fetch(API_SEND_MAIL_DATA + '/Send', requestOptions)
  }
}
