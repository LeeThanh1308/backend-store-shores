export type OrderPaymentStatusKey =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';
export enum OrderPaymentStatus {
  PENDING = 'Chờ thanh toán',
  PROCESSING = 'Chờ đóng gói',
  SHIPPING = 'Đang giao hàng',
  DELIVERED = 'Giao hàng thành công',
  CANCELLED = 'Đã huỷ',
  OUT_OF_STOCK = 'Hết hàng',
}

export enum OrderPaymentMethod {
  CASH = 'Thanh toán khi nhận hàng',
  TRANSFER = 'Thanh toán trực tuyến',
}
