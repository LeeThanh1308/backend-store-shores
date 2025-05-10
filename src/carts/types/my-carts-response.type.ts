export type MyCartResponse = {
  id: number;
  name: string;
  slug: string;
  sellingPrice: number;
  discount: number;
  productId: number;
  size: {
    id: number;
    sellingPrice: number;
    type: string;
    discount: number;
  };
  quantity: number;
  color: {
    id: number;
    createdAt: string; // ISO string
    updatedAt: string;
    name: string;
    hexCode: string;
  };
  sold: {
    sold: number;
    inventory: number;
  };
  image: string;
};

export type MyCartsResponse = {
  items: MyCartResponse[];
  total: number;
};
