import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  // isDevMode() ?
  BASE_URL = "https://75j5usrzxp4sg34xvrx7t7aae40qnogv.lambda-url.us-east-1.on.aws/";
  // headers = new HttpHeaders({
  // 'Content-Type': 'application/json',
  // // 'Authorization': 'Bearer <token>',
  // })

  public get(endpoint: string) {
    return this.http.get(`${this.BASE_URL}${endpoint}`)
  }

  public getwithparams(endpoint: string, params: HttpParams) {
    return this.http.get(`${this.BASE_URL}${endpoint}`,{
      params: params
    })
  }

  public post(endpoint: string,data:any) {
      return this.http.post(`${this.BASE_URL}${endpoint}`, data)
  }



  public delete(endpoint: string, data: any) {
    return this.http.delete(`${this.BASE_URL}${endpoint}`, data)
  }

 
}
