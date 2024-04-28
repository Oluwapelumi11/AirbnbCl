import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { Host, Review, Stay, StayFilter } from '../models/stay.model';
import { HttpService } from './http.service';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StayService {

  constructor(
    private httpService: HttpService
  ) { }

  STAY_KEY: string = 'stayDB';
  STAY_URL: string = 'listing/'

  private _stays$ = new BehaviorSubject<Stay[]>([]);
  public stays$ = this._stays$.asObservable()

  private _stayFilter$ = new BehaviorSubject<StayFilter>(this.getEmptyFilter());
  public stayFilter$ = this._stayFilter$.asObservable()

  private _stayLength$ = new BehaviorSubject<number>(1)
  public stayLength$ = this._stayLength$.asObservable()

  public loadStays() {
    this.httpService.get(this.STAY_URL + "getalllistings")
      .pipe(
        catchError((err: any) => {
          console.error('Error loading stays:', err);
          return throwError(err); 
        })
      )
      .subscribe(
        (stays: any) => {
          this._stays$.next(stays.data);
        }
      );
  }

  public query(filterBy: StayFilter) {
    const queryParams = this.getQueryParams(filterBy)
    return this.httpService.get(this.STAY_URL + queryParams) as Observable<Stay[]>
  }

  // public async loadFullLength() {
  //   const filterBy = this._stayFilter$.value
  //   const queryParams = this.getQueryParams(filterBy)

  //   const stayLength = await lastValueFrom(this.httpService.get(this.STAY_URL + 'length/' + queryParams,)) as number
  //   this._stayLength$.next(stayLength)
  // }

  public getById(stayId: string): Observable<Stay> {
    return this.httpService.get(this.STAY_URL + `GetListingById?id=${stayId}`) as Observable<Stay>
  }

  public getByUser(user: string): Observable<Stay> {
    return this.httpService.get(this.STAY_URL + `GetUserListings?user=${user}`) as Observable<Stay>
  }
  

  public saveStay(stay: Stay): Stay {
    const request = (stay._id === undefined || stay._id == null)  ? this.httpService.post(this.STAY_URL+"Createlisting", stay) : this.httpService.post(this.STAY_URL+"updatelisting", stay);
  
    request
      .pipe(
        catchError((error: any) => {
          console.error('Error saving stay:', error);
          throw error; 
        })
      )
      .subscribe(
        (data:any) => {

          console.log(data)
          console.log('Stay saved successfully');
         
        }
      );
      return stay
    }
  public getEmptyFilter() {
    return {
      likeByUser: '',
      place: '',
      label: '',
      hostId: '',
      isPetAllowed: 'false'
    }
  }

  public setFilter(filter: StayFilter) {
    this._stayFilter$.next(filter)
    // this.loadFullLength()
    this.loadStays()
  }
  
  public async setFilterAsync(filter: StayFilter) {
    this._stayFilter$.next(filter)
    // this.loadFullLength()
    await this.loadStays()
  }

  public getEmptyStay():Stay {
    return {
      name: '',
      type: '',
      imgUrls: new Array<string>(0),
      price: 0,
      summary: '',
      capacity: 0,
      amenities: new Array<string>(0),
      bathrooms: 0,
      bedrooms: 0,
      roomType: '',
      host: {
        _id: '',
        createAt: Date.now(),
        fullname: '',
        location: '',
        about: '',
        responseTime: '',
        thumbnailUrl: "https://a0.muscache.com/im/pictures/542dba0c-eb1b-4ab3-85f3-94d3cc8f87a4.jpg?aki_policy=profile_small",
        pictureUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        isSuperhost: true,
        policyNumber: 36133410
      },
      loc: {
        country: '',
        countryCode: '',
        city: '',
        address: '',
        lat: -156.6917,
        lan: 20.93792
      },
      reviews: [],
      likedByUsers: [],
      labels: [],
      statReviews: {
        cleanliness: 0,
        communication: 4.3,
        checkIn: 0,
        accuracy: 0,
        location: 0,
        value: 0
      }
    }
  }

  private getQueryParams(filterBy: StayFilter, index: number = 0) {
    let params = `?page=${index}&`
    if (filterBy.likeByUser) params += `likeByUser=${filterBy.likeByUser}&`
    if (filterBy.hostId) params += `hostId=${filterBy.hostId}&`
    if (filterBy.label) params += `label=${filterBy.label}&`
    if (filterBy.isPetAllowed) params += `isPetAllowed=${filterBy.isPetAllowed}&`
    if (filterBy.place) params += `place=${filterBy.place}`
    return params
  }

  public getEmptyReview(): Review {
    return {
      "at": Date.now(),
      "by": {
        "_id": '',
        "fullname": '',
        "imgUrl": '',
      },
      "txt": ''
    }
  }
}
