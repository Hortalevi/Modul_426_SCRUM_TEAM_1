import { Component } from '@angular/core';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  products: Product[] = [];

  constructor(private readonly service: ProductService) {}

  ngOnInit() {
    this.service.getAll().subscribe((data) => (this.products = data));
  }
}
