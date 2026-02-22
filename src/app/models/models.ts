export interface AuthUser {
  id: number;
  email: string;
}
export interface AuthProduct {
  id?: number;
  name: string;
  price: number;
  category?: string;
}

export interface DimCustomerDto {
  id: number;
  name: string;
  email?: string;
}
export interface DimProductDto {
  id: number;
  name: string;
  category: string;
  price: number;
}
export interface DimDateDto {
  id: number;
  date: string;
  year: number;
  month: number;
}
export interface DimTerritoryDto {
  id: number;
  name: string;
  country: string;
}
export interface DimVendorDto {
  id: number;
  name: string;
  location: string;
}

export interface FactSaleDto {
  id: number;
  amount: number;
  quantity: number;
  dateId: number;
  productId: number;
}
export interface FactPurchasingDto {
  id: number;
  amount: number;
  quantity: number;
  dateId: number;
  vendorId: number;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export interface PurchasingByVendorDto {
  vendor: string;
  totalAmount: number;
  totalQty: number;
}
export interface TopProductDto {
  product: string;
  sales: number;
}
export interface SalesByTerritoryDto {
  territory: string;
  sales: number;
}
export interface SalesByYearDto {
  year: number;
  sales: number;
}
export interface SalesByVendorDto {
  vendor: string;
  sales: number;
}
export interface ProductProfitDto {
  product: string;
  profit: number;
}
export interface TimeSeriesPointDto {
  period: string;
  totalAmount: number;
  totalQty: number;
}
