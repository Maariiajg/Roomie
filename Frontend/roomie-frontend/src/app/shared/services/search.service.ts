import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _searchTerm = signal<string>('');
  public readonly searchTerm = this._searchTerm.asReadonly();

  setSearchTerm(term: string) {
    this._searchTerm.set(term);
  }
}
