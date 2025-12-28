# Güvenlik ve Bot Koruması Dokümantasyonu

Bu dokümantasyon, bot koruması, DDoS koruması ve güvenlik önlemlerini içerir.

## 🛡️ Güvenlik Katmanları

### 1. Bot Detection (Bot Tespiti)

**Özellikler:**
- User-Agent analizi
- Legitimate bot whitelist (Google, Bing, vb.)
- Suspicious pattern detection
- Empty user agent blocking

**Korunan Yerler:**
- Tüm API routes
- Middleware seviyesinde kontrol

**Örnek:**
```typescript
import { detectBot } from '@/lib/security/bot-detection';

const botDetection = detectBot(userAgent);
if (botDetection.isSuspicious && !botDetection.isLegitimateBot) {
  // Block request
}
```

### 2. Advanced Rate Limiting

**Özellikler:**
- IP bazlı rate limiting
- Violation tracking
- Otomatik blocking (çok fazla violation sonrası)
- Per-endpoint rate limits

**Limitler:**
- Contact Form: 5 request/dakika
- Create Lead: 10 request/dakika
- Diğer API'ler: 20 request/dakika

**Blocking:**
- 3 violation sonrası 5 dakika block
- 5 violation sonrası 10 dakika block

### 3. Request Size Limits

**Limitler:**
- Maximum request body: 1MB
- Maximum file upload: 10MB
- Maximum files per request: 5
- Maximum query string: 2KB
- Maximum headers: 8KB

**Koruma:**
- Request size validation
- File type validation
- JSON payload depth limit (max 10 levels)

### 4. Input Sanitization

**Özellikler:**
- Null byte removal
- Control character removal
- Whitespace trimming
- Deep object sanitization

### 5. Security Headers

**Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` (CSP)

## 🚫 DDoS Koruması

### Rate Limiting Stratejisi

1. **Per-IP Rate Limiting**
   - Her IP için ayrı limit
   - IP bazlı tracking

2. **Per-Endpoint Rate Limiting**
   - Her endpoint için farklı limitler
   - Kritik endpoint'ler daha sıkı korunuyor

3. **Violation Tracking**
   - Her violation kaydediliyor
   - Belirli sayıda violation sonrası otomatik block

4. **Progressive Blocking**
   - İlk violation: Warning
   - 3 violation: 5 dakika block
   - 5 violation: 10 dakika block

### Request Validation

1. **Size Validation**
   - Request body size kontrolü
   - File size kontrolü
   - Query string length kontrolü

2. **Content Validation**
   - JSON payload validation
   - File type validation
   - Input sanitization

3. **Structure Validation**
   - JSON depth limit
   - Object size limit
   - Array length limit

## 🔒 API Route Protection

### protectAPI Fonksiyonu

Tüm API route'larında kullanılabilir:

```typescript
import { protectAPI, createProtectedResponse } from '@/lib/security/api-protection';

export async function POST(request: NextRequest) {
  // Protection check
  const protection = await protectAPI(request, {
    maxRequestSize: 100 * 1024, // 100KB
    rateLimit: {
      windowMs: 60000,
      maxRequests: 5,
    },
    allowBots: false,
  });

  if (protection) {
    return protection; // Blocked
  }

  // Your API logic here
  
  return createProtectedResponse({ success: true });
}
```

### Options

- `requireAuth`: Authentication gerektirir (gelecekte)
- `maxRequestSize`: Maximum request size (bytes)
- `rateLimit`: Rate limit ayarları
- `allowBots`: Bot'lara izin ver (default: false)

## 📊 Monitoring ve Logging

### Logged Events

1. **Blocked Requests**
   - Bot detection blocks
   - Rate limit violations
   - Size validation failures
   - Suspicious activity

2. **Metrics**
   - Request counts per IP
   - Violation counts
   - Block durations
   - Bot detection results

### Log Format

```typescript
logger.warn('Request blocked', {
  identifier: 'IP address',
  pathname: '/api/endpoint',
  reason: 'Rate limit exceeded',
  userAgent: 'User-Agent string',
});
```

## 🛠️ Vercel Özellikleri

### Edge Network Protection

Vercel otomatik olarak sağlar:
- DDoS protection
- Rate limiting at edge
- Geographic filtering
- IP reputation checking

### Security Headers

`vercel.json` dosyasında yapılandırıldı:
- Security headers
- CSP policies
- HSTS
- XSS protection

## 📝 Best Practices

### 1. Her API Route'da Protection Kullanın

```typescript
// ✅ DOĞRU
const protection = await protectAPI(request);
if (protection) return protection;

// ❌ YANLIŞ
// Protection olmadan direkt işlem yapmak
```

### 2. Uygun Rate Limits Belirleyin

```typescript
// ✅ DOĞRU - Public endpoint için sıkı limit
rateLimit: {
  windowMs: 60000,
  maxRequests: 5,
}

// ❌ YANLIŞ - Çok yüksek limit
rateLimit: {
  windowMs: 60000,
  maxRequests: 1000, // Çok yüksek!
}
```

### 3. Request Size Limits Belirleyin

```typescript
// ✅ DOĞRU
maxRequestSize: 100 * 1024, // 100KB

// ❌ YANLIŞ
// Limit belirtmemek
```

### 4. Bot Detection'i Doğru Kullanın

```typescript
// ✅ DOĞRU - Public API için bot blocking
allowBots: false

// ✅ DOĞRU - Public content için bot allowing
allowBots: true
```

## 🚨 Saldırı Senaryoları ve Koruma

### 1. DDoS Saldırısı

**Koruma:**
- Rate limiting per IP
- Progressive blocking
- Request size limits
- Vercel edge protection

**Sonuç:**
- Saldırgan IP'leri otomatik block
- Legitimate users etkilenmez
- Server kaynakları korunur

### 2. Bot Trafiği

**Koruma:**
- Bot detection
- User-Agent validation
- Pattern matching
- Legitimate bot whitelist

**Sonuç:**
- Suspicious bot'lar block edilir
- Legitimate bot'lar (Google, Bing) çalışmaya devam eder
- SEO etkilenmez

### 3. Büyük Dosya Yükleme Saldırısı

**Koruma:**
- File size limits (10MB)
- Request size limits (1MB)
- File type validation
- Number of files limit (5)

**Sonuç:**
- Büyük dosya yüklemeleri engellenir
- Server storage korunur
- Bandwidth korunur

### 4. Rate Limit Bypass Denemeleri

**Koruma:**
- IP bazlı tracking
- Violation tracking
- Progressive blocking
- Multiple violation detection

**Sonuç:**
- Bypass denemeleri tespit edilir
- Otomatik blocking aktif
- Manual intervention gerekmez

## 📈 Performance Impact

### Overhead

- **Bot Detection**: ~1-2ms
- **Rate Limiting**: ~1ms
- **Size Validation**: ~0.5ms
- **Total**: ~2-3ms overhead per request

### Caching

- Rate limit data in-memory
- Bot detection results cached
- Minimal database queries

## 🔧 Configuration

### Environment Variables

```env
# Rate limiting (optional - defaults used if not set)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# Request size limits
MAX_REQUEST_SIZE=1048576
MAX_FILE_SIZE=10485760
```

### Customization

Rate limit ve size limit'leri her endpoint için özelleştirilebilir:

```typescript
const protection = await protectAPI(request, {
  maxRequestSize: 500 * 1024, // Custom size
  rateLimit: {
    windowMs: 30000, // Custom window
    maxRequests: 10, // Custom limit
  },
});
```

## 🎯 Sonraki Adımlar

1. **CAPTCHA Integration**: Kritik endpoint'ler için CAPTCHA
2. **IP Reputation Service**: Known bad IP'leri block etmek
3. **Geographic Filtering**: Belirli ülkelerden gelen trafiği filtrelemek
4. **WAF Integration**: Web Application Firewall
5. **Redis Rate Limiting**: Distributed rate limiting için Redis

## ⚠️ Önemli Notlar

1. **Legitimate Users**: Rate limit'ler legitimate users'ı etkilememeli
2. **Monitoring**: Blocked request'leri düzenli kontrol edin
3. **Adjustment**: Rate limit'leri trafiğe göre ayarlayın
4. **Whitelist**: Known good IP'leri whitelist'e ekleyin (gelecekte)

## 📞 Support

Sorularınız için:
- Dokümantasyon: Bu dosya
- Code examples: `src/lib/security/`
- Vercel Docs: https://vercel.com/docs/security

