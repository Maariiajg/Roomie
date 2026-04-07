import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-primary py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-white font-medium">Footer</p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
