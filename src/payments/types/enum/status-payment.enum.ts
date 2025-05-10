export type OrderPaymentStatusKey =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';
export enum OrderPaymentStatus {
  PENDING = 'Chờ thanh toán',
  PROCESSING = 'Đang xử lý',
  SHIPPING = 'Đang giao hàng',
  DELIVERED = 'Giao hàng thành công',
  CANCELLED = 'Đã huỷ',
}

export enum OrderPaymentMethod {
  CASH = 'Thanh toán khi nhận hàng',
  TRANSFER = 'Thanh toán trực tuyến',
}
