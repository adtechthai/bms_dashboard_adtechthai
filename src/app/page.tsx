import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Users, Settings, Zap, Star, CheckCircle, Clock, DollarSign, TrendingUp, Code, Rocket } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">LeaniOS</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/sign-in">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-6">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
                <Rocket className="w-4 h-4 mr-2" />
                ข้าม 6 เดือนการพัฒนา
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              สร้างธุรกิจออนไลน์ยุคใหม่<br />
              <span className="text-green-500">ได้ใน 1 วัน!</span><br />
              แชท » LEAD » ยอด 💥
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              ทำไมต้องเสียเวลาหลายเดือนสร้างระบบล็อกอิน ระบบชำระเงิน และหน้าแอดมิน เมื่อคุณควรมุ่งเน้นสร้างผลิตภัณฑ์ที่มีคุณค่า? LeaniOS จัดการส่วนที่น่าเบื่อให้ คุณแค่โฟกัสสร้างธุรกิจที่ทำเงินได้จริง
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg w-full sm:w-auto">
                  เริ่มต้นฟรี - ลองเลย!
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg w-full sm:w-auto">
                  ดูตัวอย่างสด
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span>ใช้งานได้ใน 5 นาที</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>ไม่ต้องตั้งค่าอะไร</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span>ทำเงินได้วันแรก</span>
              </div>
            </div>
            
            {/* BMS Dashboard Link */}
            <div className="mt-8 text-center">
              <Link href="/bms_dashboard">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3 text-base">
                  📊 BMS Dashboard - ดูแดชบอร์ดธุรกิจ
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              คุณกำลังเสียเวลา <span className="text-red-500">หลายเดือน</span> กับสิ่งเดิมๆ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ทุกธุรกิจออนไลน์ต้องใช้พื้นฐานเดิมๆ เปลี่ยนมาสร้างธุรกิจที่ทำเงินได้จริงกันเถอะ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">เสียเวลา 3-6 เดือน</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                สร้างระบบล็อกอิน จัดการสมาชิก ระบบชำระเงิน และหน้าแอดมิน ซ้ำและซ้ำในทุกโปรเจ็กต์
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">ค่าใช้จ่ายกว่า 1.5 ล้านบาท</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                ค่าแรงงานโปรแกรมเมอร์ การตรวจความปลอดภัย การทดสอบ และการแก้ไขบั๊กสำหรับฟีเจอร์ที่ควรจะทำงานได้ตั้งแต่แรก
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">พลาดโอกาสทอง</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                ขณะที่คุณกำลังสร้างหน้าล็อกอิน คู่แข่งกำลังสร้างฟีเจอร์ที่ลูกค้าต้องการจริงๆ และเริ่มทำเงินก่อนแล้ว
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ได้ทุกสิ่งที่ต้องการใน <span className="text-green-500">5 นาที</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LeaniOS จัดการส่วนที่น่าเบื่อทั้งหมดให้ คุณแค่โฟกัสสร้างธุรกิจที่ทำเงินได้จริง
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ระบบล็อกอินที่ใช้งานได้จริง</h3>
              <p className="text-gray-600 leading-relaxed">
                เลิกแก้บั๊ก OAuth แล้ว ได้ระบบสมัครสมาชิก ล็อกอิน กู้คืนรหัสผ่าน และจัดการผู้ใช้ที่ใช้งานได้จริงตั้งแต่แรก
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">หน้าแอดมินพร้อมใช้</h3>
              <p className="text-gray-600 leading-relaxed">
                เลิกสร้างแดชบอร์ดแอดมินตั้งแต่ต้นแล้ว จัดการสมาชิก ส่งอีเมล ติดตามสถิติ และตั้งค่าแอปของคุณ - ครบจบทุกอย่าง
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">เริ่มทำเงินทันที</h3>
              <p className="text-gray-600 leading-relaxed">
                เลิกคว้าคาวกับเอกสาร Stripe แล้ว สร้างผลิตภัณฑ์ กำหนดราคา และเริ่มรับการชำระเงินได้ภายในไม่กี่นาทีหลังดีพลอย
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">สร้างด้วยเทคโนโลยีที่คุณรู้จักแล้ว</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Code className="h-8 w-8 text-gray-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Next.js 15</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">TypeScript</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Supabase</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Settings className="h-8 w-8 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">TailwindCSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ถ้าคุณสามารถลอนช์ได้ใน <span className="text-green-500">สัปดาห์น้า</span> ล่ะ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ขณะที่คู่แข่งยังสร้างหน้าล็อกอินอยู่ คุณจะเริ่มต้อนรับลูกค้าแล้ว
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">เลิกสร้าง เริ่มขาย</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">ดีพลอยในไม่กี่นาที ไม่ใช่ไม่กี่เดือน</h4>
                    <p className="text-gray-600">โคลน repo ตั้งค่า environment variables และดีพลอย SaaS ของคุณจะออนไลน์ก่อนมื้อเที่ยง</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">รับชำระเงินได้ทันที</h4>
                    <p className="text-gray-600">ต่อกับ Stripe พร้อมแล้ว สร้างผลิตภัณฑ์แรกและเริ่มทำเงินได้ตั้งแต่วันแรก</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">ขยายได้โดยไม่พัง</h4>
                    <p className="text-gray-600">สร้างด้วยเทคโนโลยีที่ผ่านการทดสอบมาแล้ว รับมือกับผู้ใช้หลายหมื่นคนได้อย่างง่ายดาย</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">คำนวณง่ายมาก</h4>
                <p className="text-gray-600">ดูว่า LeaniOS ช่วยประหยัดคุณได้มากแค่ไหน</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-gray-700">สร้างตั้งแต่ต้น</span>
                  <span className="font-bold text-red-600">6 เดือน</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">ใช้ LeaniOS</span>
                  <span className="font-bold text-green-600">1 วัน</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900">เวลาที่ประหยัด</span>
                    <span className="text-2xl font-bold text-green-600">179 วัน</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg text-gray-600">เงินที่ประหยัด</span>
                    <span className="text-lg font-bold text-green-600">2.7 ล้านบาท</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-8 bg-white rounded-2xl px-8 py-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2,847</div>
                <div className="text-sm text-gray-600">โปรเจ็กต์ที่ลอนช์</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">69 ล้าน</div>
                <div className="text-sm text-gray-600">ยอดขายรวม</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">4.9/5</div>
                <div className="text-sm text-gray-600">คะแนนนักพัฒนา</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              อย่าเชื่อแค่คำพูดของเรา
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              นักพัฒนากำลังลอนช์เร็วขึ้นและทำเงินได้มากขึ้นด้วย LeaniOS
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                \"ผมเคยใช้เวลา 4 เดือนสร้างระบบล็อกอินและชำระเงินในทุกโปรเจ็กต์ LeaniOS ทำให้เหลือแค่ 30 นาที ผมลอนช์ SaaS ไปแล้ว 3 ตัวในปีนี้ แทนที่จะเป็นแค่ 1 ตัว\"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">สม</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">สมชาย เจริญพันธ์</p>
                  <p className="text-gray-600 text-sm">นักพัฒนาอิสระ • รายได้ 1.35 ล้าน/เดือน</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                \"ทีมของเราเผาเงินไป 1.5 ล้านบาทต่อเดือนสำหรับค่าพัฒนา LeaniOS ช่วยประหยัดเวลา 6 เดือนและเงิน 9 ล้านบาท เราทำยอดได้ 3 ล้านบาทต่อเดือนเมื่อสัปดาห์ที่แล้ว\"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">นม</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">นางสาวมัลลิกา</p>
                  <p className="text-gray-600 text-sm">CTO • สตาร์ทอัพฟินเท็ค</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                \"LeaniOS คือสิ่งที่ผมอยากให้มีเมื่อ 5 ปีที่แล้ว โค้ดสะอาด เอกสารดี และทุกอย่างทำงานได้จริง โปรแกรมเมอร์จูเนียรของผมสามารถทำงานได้ตั้งแต่วันแรก\"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">กม</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">กมลเกียรติ ราชวงษ์</p>
                  <p className="text-gray-600 text-sm">Engineering Manager • บริษัทใหญ่</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            หยุดเสียเวลา เริ่มส่งมอบผลงาน
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            ร่วมกับนักพัฒนา 2,847 คนที่เลือกสร้างผลิตภัณฑ์ แทนที่จะสร้างระบบล็อกอินเดิมๆ ซ้ำไปซ้ำมาครั้งที่ 47
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold w-full sm:w-auto">
                เริ่มต้นฟรี - ลองเลย!
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg w-full sm:w-auto">
                ดูตัวอย่างสด
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>ใช้งานได้ใน 5 นาที</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>ไม่ต้องใช้บัตรเครดิต</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>เริ่มทำเงินวันนี้</span>
            </div>
          </div>
          <div className="mt-8 text-green-100 text-sm">
            <p>💡 <strong>เคล็ดลับ:</strong> ขณะที่คุณอ่านข้อความนี้ มีคนเพิ่งเปิดตัว SaaS ของเขาด้วย LeaniOS แล้ว</p>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold">LeaniOS</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                หยุดสร้างฟีเจอร์น่าเบื่อแบบเดิมๆ มาโฟกัสสิ่งที่ทำให้ SaaS ของคุณพิเศษกว่าใคร
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">ผลิตภัณฑ์</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">ฟีเจอร์</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-white transition-colors">เริ่มใช้งาน</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">เอกสาร</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">ตัวอย่าง</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">แหล่งข้อมูล</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">เรื่องราวความสำเร็จ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">ชุมชน</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">ฝ่ายสนับสนุน</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">ติดต่อ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 LeaniOS. สร้างขึ้นเพื่อนักพัฒนาที่อยากเปิดตัวเร็วขึ้น
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">นโยบายความเป็นส่วนตัว</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">ข้อกำหนดการใช้งาน</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
