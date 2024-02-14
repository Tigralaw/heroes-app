import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Hero } from '../interfaces/hero.interface';
import { environments } from 'src/environments/environments';

@Injectable({providedIn: 'root'})
export class HeroesService {

  private baseUrl: string = environments.baseUrl;

  constructor(private http: HttpClient) { }

    getHeroes():Observable<Hero[]> {
      return this.http.get<Hero[]>(`${ this.baseUrl }/heroes`);
    }

    getHeroById( id: string ): Observable<Hero|undefined> {
      return this.http.get<Hero>(`${ this.baseUrl }/heroes/${ id }`)
      .pipe(
        catchError( error => of(undefined) )
      )

    }

    getSuggestions( query: string ): Observable<Hero[]> {
      return this.http.get<Hero[]>(`${ this.baseUrl }/heroes?q=${ query }&_limit=6`);
    }

    // Metodo POST para crear un nuevo héroe
    // hero es el body (lo que se envía como parámetro en texo JSON por lo general)
    // retorna un Observable tipo Hero
    addHero( hero: Hero ): Observable<Hero> {
      return this.http.post<Hero>(`${ this.baseUrl }/heroes`, hero);
    }

    // Método PATCH para actualizar ciertas características del héroe
    // recibe y retorna un tipo Hero
    // ocupa el párametro del id ${ hero.id } porque es obligatorio de acuerdo a los requerimientos de la db (db.json)
    updateHero( hero: Hero ): Observable<Hero> {
      if ( !hero.id ) throw Error('Hero id is required');

      return this.http.patch<Hero>(`${ this.baseUrl }/heroes/${ hero.id }`, hero );
    }

    // Método DELETE para eliminar un héroe
    // recibe como parámetro un string, que es el id del objeto
    // retorna un boolean
    // Si sucede un error, el resultado es false, que significa que no se eliminó
    // Si no entra al catchError, entonces no hubo complicaciones,
    // el resultado es true y el objeto se eliminó correctamente.
    deleteHeroById( id: string ): Observable<boolean> {

      return this.http.delete(`${ this.baseUrl }/heroes/${ id }` )
      .pipe(
        map( resp => true ),
        catchError( err => of(false))
      );
    }

}
