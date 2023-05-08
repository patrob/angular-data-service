import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { signal, computed } from '@angular/core';
import {
  map,
  catchError,
  Observable,
  of,
  switchMap,
  Subject,
  tap,
  merge,
} from 'rxjs';
import { DataResult } from './data-result';

export class DataService<T> {
  protected baseUrl = 'http://localhost';
  public loading = signal(false);

  // helpers
  private load = (relativeUrl?: string) =>
    this.http.get<T | T[]>(this.getUrl(relativeUrl)).pipe(
      map((value): DataResult<T> => ({ value })),
      catchError((error): Observable<DataResult<T>> => of({ error }))
    );

  private handleReloadOrError = <T>(obs: Observable<T>) =>
    obs.pipe(
      switchMap(() => this.load()),
      catchError((error) => of({ error }))
    );

  private handleHttpCallWithId = <T>(
    id: number,
    item: T & { id: number },
    httpCall: (item: T & { id: number }) => Observable<void>
  ) =>
    id > 0
      ? httpCall(item).pipe(this.handleReloadOrError)
      : of({ error: { message: 'Id must be greater than 0' } });

  private updateHttpCall = (item: T & { id: number }) =>
    this.handleHttpCallWithId(item.id, item, (item) =>
      this.http.put<void>(this.getUrl(`${item.id}`), item)
    );
  private deleteHttpCall = (id: number) =>
    this.handleHttpCallWithId(id, { id }, (item) =>
      this.http.delete<void>(this.getUrl(`${item.id}`))
    );

  private getUrl = (relativeUrl?: string) =>
    `${this.baseUrl}${relativeUrl ? '/' : ''}${relativeUrl ?? ''}`;

  // subjects
  private loadSubject = new Subject<string>();
  private createSubject = new Subject<T>();
  private updateSubject = new Subject<T & { id: number }>();
  private deleteSubject = new Subject<number>();

  // observables
  private load$ = this.loadSubject.pipe(
    tap(() => this.loading.set(true)),
    switchMap((relativeUrl) => this.load(relativeUrl)),
    tap(() => this.loading.set(false))
  );

  private create$: Observable<DataResult<T>> = this.createSubject.pipe(
    tap(() => this.loading.set(true)),
    switchMap((item) =>
      this.http.post<void>(this.getUrl(), item).pipe(this.handleReloadOrError)
    ),
    tap(() => this.loading.set(false))
  );

  private update$: Observable<DataResult<T>> = this.updateSubject.pipe(
    tap(() => this.loading.set(true)),
    switchMap((item) => this.updateHttpCall(item)),
    tap(() => this.loading.set(false))
  );

  private delete$: Observable<DataResult<T>> = this.deleteSubject.pipe(
    tap(() => this.loading.set(true)),
    switchMap((id) => this.deleteHttpCall(id)),
    tap(() => this.loading.set(false))
  );

  private signalingObs$ = merge(
    this.load$,
    this.create$,
    this.update$,
    this.delete$
  );

  // signals
  private notifications = toSignal<DataResult<T>, DataResult<T>>(
    this.signalingObs$,
    { initialValue: {} }
  );
  public data = computed(() => this.notifications().value);
  public error = computed(() => this.notifications().error?.message);

  constructor(private http: HttpClient, baseUrl?: string) {
    this.baseUrl = baseUrl ?? this.baseUrl;
  }

  public loadData = (relativeUrl: string = ''): void =>
    this.loadSubject.next(relativeUrl);

  public loadDataWithId = (id: number): void => this.loadData(`${id}`);

  public create = (item: T): void => this.createSubject.next(item);

  public update = (item: T & { id: number }): void =>
    this.updateSubject.next(item);

  public delete = (id: number): void => this.deleteSubject.next(id);
}
