'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react'
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
  { id: 'gloves', label: 'グローブ' },
  { id: 'wraps', label: 'バンテージ' },
  { id: 'apparel', label: 'アパレル' },
  { id: 'supplements', label: 'サプリメント' },
  { id: 'accessories', label: 'アクセサリー' },
]

const emptyProduct = {
  id: '',
  name: '',
  description: '',
  price: 0,
  category: 'gloves',
  stock: 0,
  isActive: true,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product>(emptyProduct)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      })

      if (res.ok) {
        fetchProducts()
        setShowModal(false)
        setEditingProduct(emptyProduct)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openCreateModal = () => {
    setEditingProduct(emptyProduct)
    setIsEditing(false)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsEditing(true)
    setShowModal(true)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
              PRODUCTS
            </h1>
            <p className="text-dark-400">商品管理</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            新規商品
          </Button>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              placeholder="商品名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </Card>

        {/* Products Table */}
        <Card className="overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>商品名</th>
                    <th>カテゴリー</th>
                    <th>価格</th>
                    <th>在庫</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                              <Package className="w-5 h-5 text-dark-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-dark-400 truncate max-w-[200px]">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-dark-300">
                            {categories.find(c => c.id === product.category)?.label}
                          </span>
                        </td>
                        <td>
                          <span className="text-white font-medium">{formatCurrency(product.price)}</span>
                        </td>
                        <td>
                          <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                            {product.stock}個
                          </span>
                        </td>
                        <td>
                          <Badge variant={product.isActive ? 'success' : 'danger'}>
                            {product.isActive ? '販売中' : '非公開'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditModal(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        <Package className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                        <p className="text-dark-400">商品が見つかりません</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? '商品を編集' : '新規商品'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="商品名"
            value={editingProduct.name}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            required
          />
          <div>
            <label className="input-label">説明</label>
            <textarea
              className="input min-h-[100px]"
              value={editingProduct.description || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="価格（円）"
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="在庫数"
              type="number"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">カテゴリー</label>
              <select
                className="input"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">ステータス</label>
              <select
                className="input"
                value={editingProduct.isActive ? 'true' : 'false'}
                onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.value === 'true' })}
              >
                <option value="true">販売中</option>
                <option value="false">非公開</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? '更新' : '作成'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
