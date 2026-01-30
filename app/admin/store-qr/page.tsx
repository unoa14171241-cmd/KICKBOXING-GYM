'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, Button } from '@/components/ui'
import { QrCode, Printer, Download } from 'lucide-react'

export default function StoreQRPage() {
  const qrRef = useRef<HTMLDivElement>(null)
  
  // チェックインページのURL
  const checkInUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/checkin`
    : 'https://kickboxing-gym.onrender.com/checkin'

  const handlePrint = () => {
    const printContent = qrRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>チェックイン用QRコード</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: sans-serif;
              background: white;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 10px;
              color: #ec4899;
            }
            h2 {
              font-size: 24px;
              margin-bottom: 30px;
              color: #333;
            }
            .qr-wrapper {
              padding: 20px;
              background: white;
              border: 4px solid #ec4899;
              border-radius: 20px;
              display: inline-block;
            }
            .instructions {
              margin-top: 30px;
              font-size: 18px;
              color: #666;
            }
            .step {
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>KICKBOXING TRIM GYM</h1>
            <h2>📱 セルフチェックイン</h2>
            <div class="qr-wrapper">
              ${printContent.innerHTML}
            </div>
            <div class="instructions">
              <p class="step">1️⃣ スマホでQRコードを読み取る</p>
              <p class="step">2️⃣ ログインする（初回のみ）</p>
              <p class="step">3️⃣ 自動でチェックイン完了！</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-900 mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
            STORE QR CODE
          </h1>
          <p className="text-dark-500">店舗設置用チェックインQRコード</p>
        </div>

        <Card className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">セルフチェックイン用QRコード</h2>
            <p className="text-dark-500">このQRコードを印刷して店舗入口に設置してください</p>
          </div>

          <div 
            ref={qrRef}
            className="inline-block p-6 bg-white rounded-2xl border-4 border-primary-500 shadow-lg"
          >
            <QRCodeSVG
              value={checkInUrl}
              size={250}
              level="H"
              includeMargin={true}
              fgColor="#171717"
            />
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left max-w-md mx-auto">
            <p className="text-sm font-medium text-dark-900 mb-2">チェックインURL:</p>
            <code className="text-xs text-primary-600 break-all">{checkInUrl}</code>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <Button onClick={handlePrint}>
              <Printer className="w-5 h-5 mr-2" />
              印刷する
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-dark-900 mb-4">使い方</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-dark-900">QRコードを印刷</p>
                <p className="text-sm text-dark-500">「印刷する」ボタンからQRコードを印刷します</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-dark-900">店舗入口に設置</p>
                <p className="text-sm text-dark-500">受付や入口付近の見やすい場所に掲示します</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-dark-900">会員がスマホで読み取り</p>
                <p className="text-sm text-dark-500">会員がQRコードを読み取ると自動でチェックイン/アウトされます</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">💡 ヒント</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 会員は初回のみログインが必要です（次回からは自動）</li>
            <li>• 同じQRコードでチェックインとチェックアウトが切り替わります</li>
            <li>• チェックイン履歴は管理画面で確認できます</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  )
}
