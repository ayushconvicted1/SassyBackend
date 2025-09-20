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