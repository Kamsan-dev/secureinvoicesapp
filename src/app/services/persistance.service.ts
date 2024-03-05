import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root',
})
export class PersistanceService {
   constructor() {}

   set(key: string, value: any): void {
      try {
         window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
         console.error('Error saving to localStorage', error);
      }
   }

   get(key: string): unknown {
      try {
         const localStorageItem = window.localStorage.getItem(key);
         return localStorageItem ? JSON.parse(localStorageItem) : null;
      } catch (error) {
         console.error('Error getting from localStorage', error);
         return null;
      }
   }
}
