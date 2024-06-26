import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError} from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { HttpService } from './http.service';
import { OrderService } from './order.service';
// import { SocketService } from './socket.service';
import { StayService } from './stay.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  constructor(
    private httpService: HttpService,
    private stayService: StayService,
    // private socketService: SocketService,
    public orderService: OrderService,
    public snackBar: MatSnackBar) {
      const user = this.getUser()
      this._user$.next(user)
      if(user) {
        // this.socketService.login(user._id)
        // this.socketService.on(this.socketService.SOCKET_EMIT_ORDER_FOR_HOST, this.hostFunction)
        // this.socketService.on(this.socketService.SOCKET_EMIT_ORDER_FOR_USER, this.userFunction)
      }
  }

  private USER_URL = 'user/'
  private STORAGE_KEY_LOGGEDIN_USER = 'user'
  private AUTH_URL = 'authentication/'

  private _user$ = new BehaviorSubject<User | null>(null)
  public user$ = this._user$.asObservable()

  hostFunction = this.updateHostMsg.bind(this)
  userFunction = this.updateUserMsg.bind(this)

  public getUser(): User {
    return JSON.parse(sessionStorage.getItem(this.STORAGE_KEY_LOGGEDIN_USER) as string)
  }

  public async login(credentials: User) {
    try {

      this.httpService.post(this.AUTH_URL + 'login', credentials)
  .subscribe(
    (response: any) => {
      console.log('Response:', response);
      this.saveLocalUser(response)
        this._user$.next(response)
    }
  );

    } catch (err) {
      throw err
    }
  }
  
  public async signup(user: User) {
    try {
      this.httpService.post(this.AUTH_URL + 'register', user)
        .subscribe(
          (user: any ) => {
            this.saveLocalUser(user);
            this._user$.next(user);
          }
        );
    } catch (error) {
      throw error;
    }
  }

  public getEmptyUser() {
    return {
      username: '',
      fullname: '',
      password: '',
      imgUrl: '',
      userMsg: 0,
      hostMsg: 0
    }
  }

  async update(user: User) : Promise<User> {
    try {
      if (!user) {

        this.httpService.post(this.USER_URL, user)
        .subscribe(
          (updatedUse: any) => {
            const updatedUser = updatedUse as User;
            this.saveLocalUser(updatedUser);
            this._user$.next(updatedUser);
            return updatedUser;
          }
        );
      }
    } catch (error) {
      throw error;
    }
    return user
  }

  async updateHostMsg(order: Order) {
    try {
      const user = this.getUser()
      user.hostMsg++
      await this.update(user)
      const msg = `${order.buyer.fullname} invite your place`
      this.snackBar.open(msg, 'Close', { duration: 3000 })
      this.orderService.loadOrders(user.username)
    } catch (err) {
      console.log('err:', err)
    }
  }

  async updateUserMsg(order: Order) {
    try {
      const user = this.getUser()
      user.userMsg++
      await this.update(user)
      const msg = `${order.stay.name} update your vacation status`
      this.snackBar.open(msg, 'Close', { duration: 3000 })
      this.orderService.loadOrders(user.username)
    } catch (err) {
      console.log('err:', err)
    }
  }

  public async logout() {
    try {
      // await lastValueFrom(this.httpService.post(this.AUTH_URL + 'logout'))?
      sessionStorage.clear()
      // this.socketService.logout()
      // this.socketService.off(this.socketService.SOCKET_EMIT_ORDER_FOR_HOST, this.hostFunction)
      // this.socketService.off(this.socketService.SOCKET_EMIT_ORDER_FOR_USER, this.userFunction)
      this._user$.next(null)
      window.location.assign('/')
    } catch (err) {
      console.log('err:', err)
    }
  }

  private saveLocalUser(user: User) {
    sessionStorage.setItem(this.STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
  }
}
