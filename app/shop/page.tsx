'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, Button, Badge } from '@/components/ui'
import { ShoppingBag, Package, Filter, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  stock: number
  isActive: boolean
}

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'gloves', label: 'グローブ' },
  { id: 'wraps', label: 'バンテージ' },
  { id: 'apparel', label: 'アパレル' },
  { id: 'accessories', label: 'アクセサリー' },
  { id: 'supplements', label: 'サプリメント' },
]

const categoryLabels: Record<string, string> = {
  gloves: 'グローブ',
  wraps: 'バンテージ',
  apparel: 'アパレル',
  accessories: 'アクセサリー',
  supplements: 'サプリメント',
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('商品情報の取得に失敗しました')
        const data = await res.json()
        setProducts(data.filter((p: Product) => p.isActive))
      } catch (err) {
        setError('商品情報を取得できませんでした')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            SHOP
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            トレーニング用品・オリジナルグッズ
          </motion.p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ml-3 text-gray-600">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {selectedCategory === 'all' 
                  ? '現在商品はありません' 
                  : 'このカテゴリーの商品はありません'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hoverable className="h-full flex flex-col">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-gray-100 text-gray-600">
                        {categoryLabels[product.category] || product.category}
                      </Badge>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="text-xs text-orange-500">残りわずか</span>
                      )}
                      {product.stock === 0 && (
                        <span className="text-xs text-red-500">在庫切れ</span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      <Button 
                        size="sm" 
                        disabled={product.stock === 0}
                        className={product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        {product.stock === 0 ? '売切れ' : '購入'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ご購入について
          </h2>
          <p className="text-gray-600">
            商品のご購入はジム受付にて承っております。<br />
            会員の方は会員価格にてご購入いただけます。
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
