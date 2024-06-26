import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, filter } from 'rxjs';
import { Stay, StayFilter } from 'src/app/models/stay.model';
import { LoaderService } from 'src/app/services/loader.service';
import { StayService } from 'src/app/services/stay.service';
import { faList, faMapLocationDot } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'stay-index',
  templateUrl: './stay-index.component.html',
  styleUrls: ['./stay-index.component.scss']
})
export class  StayIndexComponent implements OnInit, OnDestroy {

  @ViewChild('elFooter') elFooter: any

  constructor(
    private stayService: StayService,
    public loader: LoaderService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  stays$ !: Observable<Stay[]> | null
  isShowScroller: boolean = false
  subscription!: Subscription
  isShowClearBtn: boolean = false
  stayLoadIndex: number = 1
  stayFullLength: number = 0
  isLoadStay: boolean = false
  subscriptionStayLength!: Subscription
  isShowMap:boolean = false
  listIcon = faList
  mapIcon = faMapLocationDot
  
  async ngOnInit() {
    this.stayService.loaded$.subscribe(res => {
      this.isLoadStay = res  
    console.log(res)    })
      this.loader.setLoading(true)
    // // this.subscriptionStayLength = this.stayService.stayLength$.subscribe(stayLength => {
    //     this.stayFullLength = stayLength
    //     this.stayLoadIndex = 1
    //   }
      
      // )
      
      // this.loader.setLoading(true)
    await this.setFilterFromParams()
    this.stays$ = this.stayService.stays$
    window.addEventListener('scroll', () => this.onScroll())

    this.subscription = this.stayService.stayFilter$.subscribe(stayFilter => {
      this.isShowClearBtn = this.checkIfClearFilter(stayFilter)
    })
    // console.log("stays: ")
    // this.stays$.subscribe((val:any)=>{ 
    // // this.stays$ = val
    // if(val?.length){
    //   this.loader.setLoading(false)
    //   this.isLoadStay = true
    //   this._loaded.next(true)
    // }
    
    // })
  }

  async onPageScroll() {
    const element = this.elFooter.nativeElement
    if (element.clientHeight + element.offsetTop <= window.scrollY + window.innerHeight && !this.isShowMap) {
   
        // this.isLoadStay = true
        // this.loader.setLoading(true)
        // await this.stayService.loadStays();
        this.isLoadStay = true
        this.loader.setLoading(false)
        this.stayLoadIndex++

    }
  }

  async setFilterFromParams() {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const stayFilter = {
      ...this.stayService.getEmptyFilter(),
      ...queryParams as StayFilter
    }
  
    if (Object.keys(queryParams).length === 0) {
      this.stayService.loadStays();
    } else {
      await this.stayService.setFilterAsync(stayFilter)
      this.stayService.query(stayFilter)
    }
  
   
  }
  

  onPageUp() {
    window.scrollTo(0, 0)
  }

  onScroll() {
    if (window.scrollY >= 150) {
      this.isShowScroller = true
    } else {
      this.isShowScroller = false
    }
  }

  async onClearFilter() {
    this.loader.setLoading(true)
    const filter = this.stayService.getEmptyFilter()
    await this.stayService.setFilterAsync(filter)
    this.loader.setLoading(false)
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: filter,
        queryParamsHandling: 'merge'
      }
    )
  }

  checkIfClearFilter(stayFilter: StayFilter): boolean {
    if (stayFilter.place || stayFilter.label || stayFilter.isPetAllowed === 'true') return true
    return false
  }

  get IsShowMapBtn() {
    return this.stayFullLength
    && !this.loader.getLoading()
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', () => this.onScroll())
  }
showChat:boolean = false;
  toggleChat(){
    this.showChat =!this.showChat
  }
}
