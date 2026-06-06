# إعداد Firebase Authentication

## الخطوات

### 1. إنشاء مشروع Firebase
- اذهب إلى https://console.firebase.google.com
- اضغط "Add project" وأنشئ مشروع جديد

### 2. إضافة تطبيق Web
- Project Settings (⚙️) ← General ← Your apps ← Add app ← Web (</>)
- انسخ الـ firebaseConfig

### 3. نسخ الإعدادات
```bash
cp .env.example .env
# ثم ضع قيمك في .env
```

### 4. تفعيل مزودي تسجيل الدخول
Authentication ← Sign-in method ← فعّل كل مزود تريده:

| المزود | المتطلبات |
|--------|-----------|
| **Google** | مجاني، يعمل مباشرة |
| **Facebook** | تحتاج Facebook Developer App (مجاني) |
| **Apple** | تحتاج Apple Developer Account ($99/سنة) |
| **Microsoft** | تحتاج Azure App Registration (مجاني) |

### 5. إضافة Authorized Domains
Authentication ← Settings ← Authorized domains ← Add domain
- أضف domain موقعك (مثل: `yourdomain.com`)
- `localhost` مضاف تلقائياً للتطوير

### 6. إعداد Facebook (إذا أردته)
1. اذهب إلى https://developers.facebook.com
2. أنشئ App جديد
3. أضف Facebook Login
4. انسخ App ID و App Secret إلى Firebase

### 7. تشغيل المشروع
```bash
npm install
npm run dev
```

## ملاحظة على خطأ `lookup type 6 format 2`
هذا الخطأ ناتج عن قيود مكتبة opentype.js مع بعض خطوط الخط العربي المعقدة.
تم تحسين الكود للتعامل مع هذا الخطأ بشكل آمن — الخط يُنزَّل بدل إيقاف العملية.
