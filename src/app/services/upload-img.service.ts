import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadImgService {

  constructor() { }

  CLOUD_NAME: string = "dvdgrrdwe"; // Replace with your Cloudinary cloud name
  API_KEY: string = "653284548921728"; // Replace with your Cloudinary API key
  API_SECRET: string = "us6UKfFmF_hiQG0Q-w_VdGbP57s"; // Replace with your Cloudinary API secret
  UPLOAD_URL: string = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;

  public async uploadImg(ev: any) {
    const formData = new FormData()
    formData.append('file', ev.target?.files[0])
    formData.append('api_key', this.API_KEY)
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString());
    formData.append('signature', await this.generateSignature());
    
    return fetch(this.UPLOAD_URL, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(res => {
        console.log(res)
        return res
      })
      .catch(err => console.error(err))
  }

  private async  generateSignature() {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `timestamp=${timestamp}${this.API_SECRET}`;
    const crypto = window.crypto || window.Crypto; // Check for crypto API support
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const signature = crypto.subtle.digest('SHA-256', data);
    return this.hex(await signature);
}

private async hex(buffer: ArrayBuffer): Promise<string> {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
        const value = view.getUint32(i);
        const stringValue = value.toString(16);
        const padding = '00000000';
        const paddedValue = (padding + stringValue).slice(-padding.length);
        hexCodes.push(paddedValue);
    }
    return hexCodes.join('');
}

}
