export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  short_description: string | null;
  description: string | null;
  category_id: string;
  category_slug?: string;
  category_name?: string;
  price: number;
  mrp: number;
  discount_percent: number;
  sku_prefix: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  rating_avg: number;
  rating_count: number;
  thumbnail_url: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_thumbnail: boolean;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  price_delta: number;
  is_active: boolean;
};

export type Inventory = {
  variant_id: string;
  stock_qty: number;
  reserved_qty: number;
  available_qty: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
};

export type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'discount';
