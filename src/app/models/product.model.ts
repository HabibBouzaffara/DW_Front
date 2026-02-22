export interface Product {
  id: number;
  productName: string;
  standardCost: number;
  listPrice: number;
  subcategory: string;
  category: string;
  image: string; // base64 data URI
}
