import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const registerResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      // Se l'errore è dovuto al parsing JSON su una registrazione con status 201
      if (error.url?.includes('/auth/register') && error.status === 201 && 
          error.message?.includes('JSON')) {
        // Restituisci una risposta di successo
        return of(new HttpResponse({
          status: 201,
          body: { message: 'Utente registrato con successo' },
          url: error.url
        }));
      }
      
      // Per tutti gli altri errori, rilancia l'errore
      throw error;
    })
  );
};
