import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, lastValueFrom, Observable } from 'rxjs';
import { FilterOrder, Order } from '../models/order.model';
import { HttpService } from './http.service';
import { UserService } from './user.service';
import { User } from '../models/user.model';
// import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpService: HttpService,
    // private socketService: SocketService,
  ) { }
  ORDER_STORAGE_KEY = 'orders'
  ORDER_URL = 'order/'
  user :User = this.getUser();
  private _orders$ = new BehaviorSubject<Order[]>([])
  public orders$ = this._orders$.asObservable()

  private _order$ = new BehaviorSubject<Order>(this.getEmptyOrder() as Order)
  public order$ = this._order$.asObservable()

  private _orderFilter$ = new BehaviorSubject<FilterOrder>(this.getEmptyFilter());
  public orderFilter$ = this._orderFilter$.asObservable()

  public getCurrOrder() {
    return Promise.resolve(this._order$.value)
  }

  public async loadOrders(user:string) {
    const filterBy = this._orderFilter$.value
    this.httpService.get(this.ORDER_URL+"orders?user="+user)
      .pipe(
        catchError((error: any) => {
          console.error('Error fetching orders:', error);
          throw error; 
        })
      )
      .subscribe(
        (orders: any) => {
          console.log(orders);
          this._orders$.next(orders);
        }
      );
    
  }

  public getUser(): User {
    return JSON.parse(sessionStorage.getItem("user") as string)
  }


  public query(filterBy: FilterOrder | null) {
    const queryParams = this.getQueryParams(filterBy)
    return this.httpService.get(this.ORDER_URL + "filter?label="+filterBy) as Observable<Order[]>
  }

  public save(order: Order) {
    console.log(order)
    if(order._id === null || order._id === undefined){
      return this.httpService.post(this.ORDER_URL+"Create" , order)
      .pipe(
        catchError((error: any) => {
          console.error('Error saving order:', error);
          throw error; 
        })
      )
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
        }
      );
    }else{
      return this.httpService.post(this.ORDER_URL+"Update" , order)
      .pipe(
        catchError((error: any) => {
          console.error('Error updating order:', error);
          throw error; 
        })
      )
    .subscribe(
      (response: any) => {
        console.log('Response:', response);
      }
    );
  }
  }

  public getEmptyFilter() {
    return {
      stayName: '',
      hostName: '',
      checkIn: new Date(),
      checkOut: new Date(),
      totalPrice: 0,
      status: '',
      hostId: '',
      buyerId: '',
      term: ''
    }
  }

  public setFilter(filter: FilterOrder) {
    this._orderFilter$.next(filter)
    this.loadOrders(this.user.fullname)
  }

  public setOrder(order: Order) {
    this._order$.next(order)
  }

  public getEmptyOrder() {
    return {
      buyer: {
        _id: '',
        fullname: ''
      },
      totalPrice: 0,
      startDate: new Date(0),
      endDate: new Date(0),
      guests: {
        adults: 1,
        children: 0,
        infants: 0,
        pets: 0,
      },
      host: {
        _id: '',
        fullname: ''
      },
      stay: {
        _id: '',
        name: '',
        price: 0
      },
      status: 'pending'
    }
  }

  private getQueryParams(filterBy: FilterOrder | null) {
    let params = '?'
    if (filterBy?.term) params += `term=${filterBy.term}&`
    if (filterBy?.hostId) params += `hostId=${filterBy.hostId}&`
    if (filterBy?.buyerId) params += `buyerId=${filterBy.buyerId}&`
    if (filterBy?.status) params += `status=${filterBy.status}&`
    if (filterBy?.stayName) params += `stayName=${filterBy.stayName}&`
    if (filterBy?.hostName) params += `hostName=${filterBy.hostName}&`
    if (filterBy?.totalPrice) params += `totalPrice=${filterBy.totalPrice}&`
    return params
  }
}
