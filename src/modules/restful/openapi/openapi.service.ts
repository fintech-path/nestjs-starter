import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class OpenapiService {
  constructor(private readonly httpService: HttpService) {}

  async baiduBaike(key: string): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService
      .get(
        encodeURI(
          `https://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=${key}&bk_length=600`,
        ),
      )
      .pipe(map((response) => response.data));
  }

  async myip(): Promise<Observable<AxiosResponse<any, any>>> {
    return this.httpService
      .get('http://api.myip.com')
      .pipe(map((response) => response.data));
  }
}
