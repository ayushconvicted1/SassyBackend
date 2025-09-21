export const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  createdAt: true,
  isAvailable: true,
  images:{
    select:{
        url:true
    }
  }
};

type ProductResponse = {
  id: number
  name: string
  description?: string
  price: string
  stock: number
  isAvailable: boolean
  categoryId?: number
  createdAt: string
  updatedAt: string
  category?: { id: number; name: string }
  images: { url: string }[]
  sizes: any[]
  tags: { tag: { name: string } }[]
}

export function formatProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price), 
    stock: product.stock,
    isAvailable: product.isAvailable,
    category: product.category?.name ?? null,
    images: product.images?.map((img:any) => img.url) ?? [],
    tags: product.tags?.map((t:any) => t.tag.name) ?? [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}