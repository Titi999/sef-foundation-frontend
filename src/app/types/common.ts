export interface Paginations<T> {
  total: number;
  currentPage: number;
  totalPages: number;
  items: T;
}
