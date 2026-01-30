'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Button, Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ShoppingBag, ShoppingCart, Package, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string
  stock: number
}

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'gloves', label: 'グローブ' },
  { id: 'wraps', label: 'バンテージ' },
  { id: 'apparel', label: 'アパレル' },
  { id: 'supplements', label: 'サプリメント' },
  { id: 'accessories', label: 'アクセサリー' },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const url = selectedCategory === 'all'
        ? '/api/products'
        : `/api/products?category=${selectedCategory}`
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              SHOP
            </h1>
            <p className="text-dark-400">オンラインショップ</p>
          </div>
          {cartCount > 0 && (
            <Button>
              <ShoppingCart className="w-5 h-5 mr-2" />
              カート ({cartCount}) - {formatCurrency(cartTotal)}
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-dark-400 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full flex flex-col">
                  {/* Product Image */}
                  <div className="aspect-square rounded-xl bg-dark-700 mb-4 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-dark-500" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <Badge variant="default">
                        {categories.find(c => c.id === product.category)?.label || product.category}
                      </Badge>
                    </div>
                    {product.description && (
                      <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(product.price)}
                    </span>
                    {product.stock > 0 ? (
                      <Button size="sm" onClick={() => addToCart(product)}>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        カートに追加
                      </Button>
                    ) : (
                      <Badge variant="danger">在庫切れ</Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 mb-2">商品がありません</p>
            <p className="text-sm text-dark-500">
              {selectedCategory !== 'all' && '別のカテゴリーを選択してください'}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
