import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { filter, switchMap, tap } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  // Formulario reactivo, debe tener las propiedades de la interface
  // ( en este caso hero.interface.ts )
  // new formGroup([]) para el objeto
  // new FormControl('') para las propiedades
  public heroForm = new FormGroup({
  id:               new FormControl<string>(''),
  // nonNullable en true nos indica que la propiedad superhero no puede ser nula
  // y el hecho de que no tenga el signo ? por ejemplo superhero?:
  // no es opcional, por lo que es obligatoria
  // asi que la propiedad superhero siempre tiene que ser de tipo string
  // indicado en el FormControl como FormControl<string>
  superhero:        new FormControl<string>('', { nonNullable: true } ),
  // Este FormControl es tipo Publisher como la interface de hero lo indica
  // Se inicializa con uno de los valores que acepta este objeto
  publisher:        new FormControl<Publisher>( Publisher.DCComics ),
  alter_ego:        new FormControl(''),
  first_appearance: new FormControl(''),
  characters:       new FormControl(''),
  alt_img:          new FormControl(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ]

  constructor(
    private HeroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
    ) {}

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {

    if ( !this.router.url.includes('edit') ) return;

    this.activatedRoute.params
    .pipe(
      switchMap( ({ id }) => this.HeroesService.getHeroById( id )),
    ).subscribe( hero => {
      console.log("Datos del héroe a editar: " + JSON.stringify(hero));
      if ( !hero ) return this.router.navigateByUrl('/');

      this.heroForm.reset( hero );
      return;
    });

  }

  onSubmit():void {

    if ( this.heroForm.invalid ) return;

    if ( this.currentHero.id ) {
      this.HeroesService.updateHero( this.currentHero )
      .subscribe( hero => {
        // Mostrar snackbar
        this.showSnackbar(`${ hero.superhero } updated!`);
      });
    }

    this.HeroesService.addHero( this.currentHero )
    .subscribe( hero => {
      //Navegar a /heroes/edit/ hero.id
      this.router.navigate(['/heroes/edit', hero.id]);
      // Mostrar sanckbar
      this.showSnackbar(`${ hero.superhero } created!`);
    });

  }

  onDeleteHero() {
    if ( !this.currentHero.id ) throw Error('Hero id is required');

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      data: this.heroForm.value
    });

dialogRef.afterClosed()
.pipe(
  filter( (result: boolean) => result ),
  switchMap( () => this.HeroesService.deleteHeroById( this.currentHero.id ) ),
  filter( (wasDeleted: boolean) => wasDeleted ),
)
.subscribe(result => {
  this.router.navigateByUrl('/heroes');
})

    // dialogRef.afterClosed().subscribe(result => {
    //   if ( !result ) return;

    //   this.HeroesService.deleteHeroById( this.currentHero.id )
    //   .subscribe( wasDeleted => {
    //     if ( wasDeleted ) {
    //     console.log('deleted!', + wasDeleted);
    //     this.router.navigateByUrl('/heroes');
    //     }
    //   });

    // });
  }

  showSnackbar( message: string ):void {
    this.snackbar.open( message, 'done', {
      duration: 2500,
    })
  }

}
