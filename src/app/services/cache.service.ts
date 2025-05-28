import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 300000; // 5 minuti

  get<T>(
    key: string, 
    fetcher: () => Observable<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Observable<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Se è in cache e non è scaduto
    if (cached && (now - cached.timestamp) < cached.ttl) {
      console.log(`Cache HIT for key: ${key}`);
      return of(cached.data);
    }

    console.log(`Cache MISS for key: ${key}`);
    // Fetch dai dati e salva in cache
    return fetcher().pipe(
      tap(data => {
        this.cache.set(key, {
          data,
          timestamp: now,
          ttl
        });
        console.log(`Cached data for key: ${key}`);
      })
    );
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    console.log(`Invalidated cache for key: ${key}`);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        console.log(`Invalidated cache for key: ${key}`);
      }
    });
  }

  clear(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  getStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
