'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, Button, Badge } from '@/components/ui'
import { ShoppingBag, Package, Filter, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  stock: number
}

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'gloves', label: 'グローブ' },
  { id: 'wraps', label: 'バンテージ' },
  { id: 'apparel', label: 'アパレル' },
  { id: 'supplements', label: 'サプリメント' },
]

// デモ商品データ
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'BLAZEオリジナルグローブ 14oz',
    description: 'トレーニング用高品質ボクシンググローブ。手首のサポート力が高く、長時間の使用でも快適です。',
    price: 12800,
    category: 'gloves',
    stock: 20,
  },
  {
    id: '2',
    name: 'BLAZEオリジナルグローブ 16oz',
    description: 'スパーリング用ボクシンググローブ。クッション性が高く安全にトレーニングできます。',
    price: 14800,
    category: 'gloves',
    stock: 15,
  },
  {
    id: '3',
    name: 'バンテージ 4.5m',
    description: '伸縮性のある練習用バンテージ。手首と拳をしっかり保護します。',
    price: 1500,
    category: 'wraps',
    stock: 50,
  },
  {
    id: '4',
    name: 'BLAZEドライTシャツ',
    description: '吸汗速乾素材のトレーニングTシャツ。BLAZEロゴ入り。',
    price: 4500,
    category: 'apparel',
    stock: 30,
  },
  {
    id: '5',
    name: 'ホエイプロテイン 1kg',
    description: '高品質ホエイプロテイン。トレーニング後の筋肉回復をサポート。',
    price: 5800,
    category: 'supplements',
    stock: 25,
  },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const url = selectedCategory === 'all'
      ? '/api/products'
      : `/api/products?category=${selectedCategory}`
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products)
        }
      })
      .catch(() => {
        // APIエラー時はデモデータを使用
      })
  }, [selectedCategory])

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 pattern-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            SHOP
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark-400"
          >
            トレーニングに必要なギアをオンラインで購入
          </motion.p>
        </div>
      </section>

      {/* Shop */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full flex flex-col">
                  {/* Product Image */}
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 mb-4 flex items-center justify-center">
                    <Package className="w-16 h-16 text-dark-500" />
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
                    <Link href="/login">
                      <Button size="sm">
                        購入する
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Login Prompt */}
          <div className="mt-12 text-center">
            <Card variant="glass" className="inline-block p-8">
              <ShoppingBag className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">会員価格でお得に購入</h3>
              <p className="text-dark-400 mb-4">
                会員登録すると、全商品10%OFFでご購入いただけます
              </p>
              <Link href="/register">
                <Button>
                  会員登録する
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
