# NISSPY

**Teknik & Akademik Başarı Asistanı** — Haftalık planlama, yol haritaları, sprint planı ve yapay zeka destekli koç sohbeti ile üretkenliğinizi artırın.

---

## Özellikler

- **Haftalık Plan** — Günlük bloklar halinde görevlerinizi planlayın (Trainee / School / Rest / Focus). Veriler Supabase ile senkronize edilir.
- **Yol Haritaları** — Hedeflerinize göre özelleştirilebilir yol haritaları; ilerlemenizi takip edin.
- **Sprint Planı** — Haftalık odak ve görev listeleri ile sprint bazlı çalışma.
- **Yapay Zeka Koçu** — Google Gemini API ile sohbet tabanlı koçluk (isteğe bağlı).
- **Profil** — Avatar, görünen ad, hedefler, odak blokları ve motivasyon modu (Normal / Düşük).
- **Odak Blok Sistemi** — Teknik, tekrar ve ısınma bloklarını süre ve etiketle özelleştirin.
- **Açık / Koyu Tema** — Göz yormayan arayüz seçenekleri.
- **PDF / Excel Dışa Aktarma** — Planlarınızı dışa aktarabilirsiniz (jspdf, xlsx).

---

## Teknolojiler

| Katman      | Teknoloji |
|------------|-----------|
| Frontend   | React 19, TypeScript, Vite 6 |
| Stil       | Tailwind CSS (utility sınıfları) |
| Auth & DB  | Supabase (kimlik doğrulama, `user_schedules`, `profiles`) |
| AI Koç     | Google Gemini API (`@google/genai`) |
| Dışa aktarım | jsPDF, jspdf-autotable, xlsx |

Backend klasörü ileride özel API (örn. Node/Express) eklenmek üzere ayrılmıştır; şu an tüm işlemler frontend, Supabase ve Gemini ile yürütülür.

---

## Gereksinimler

- **Node.js** (v18+ önerilir)
- **Supabase** hesabı (giriş ve veri için zorunlu)
- **Google Gemini API anahtarı** (sadece Yapay Zeka Koçu için isteğe bağlı)

---

## Kurulum

### 1. Depoyu klonlayın ve frontend dizinine gidin

```bash
git clone <repo-url>
cd nisspy-main/frontend
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Ortam değişkenlerini ayarlayın

`frontend` klasöründe `.env.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env.local
```

**.env.local** içeriği (örnek):

```env
# Zorunlu — https://supabase.com/dashboard > Proje > Settings > API
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# İsteğe bağlı — Yapay Zeka Koçu için (boş bırakılırsa koç sohbeti devre dışı kalır)
VITE_GEMINI_API_KEY=
```

### 4. Supabase şemasını oluşturun

[Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** → **New query** açın ve `frontend/supabase/schema.sql` dosyasındaki SQL betiğini çalıştırın. Bu işlem `user_schedules` ve `profiles` tablolarını ve RLS politikalarını oluşturur.

### 5. Uygulamayı çalıştırın

```bash
npm run dev
```

Tarayıcıda **http://localhost:3000** adresini açın.

---

## Docker ile çalıştırma

Proje kökünden (docker-compose.yml’in bulunduğu dizin):

```bash
docker compose up --build
```

Uygulama **http://localhost:3000** üzerinde sunulur. Frontend `.env.local` değişkenleri için `frontend` klasöründe dosyanın hazır olduğundan emin olun (volume ile mount edilir).

---

## Proje yapısı (özet)

```
nisspy-main/
├── README.md                 # Bu dosya
├── .env.example              # Örnek ortam değişkenleri (kök)
├── docker-compose.yml        # Frontend container
├── backend/                  # İleride API sunucusu için ayrıldı
│   └── README.md
└── frontend/
    ├── package.json
    ├── .env.example          # Frontend ortam değişkenleri
    ├── App.tsx               # Ana uygulama ve sekmeler
    ├── components/           # Dashboard, Roadmaps, SprintPlanner, CoachChat, Profile, vb.
    ├── context/              # AuthContext, ThemeContext
    ├── lib/                  # supabase, exportSchedule
    ├── services/             # geminiService
    └── supabase/
        └── schema.sql        # user_schedules, profiles + RLS
```

---

## Scripts (frontend)

| Komut           | Açıklama                    |
|-----------------|-----------------------------|
| `npm run dev`   | Geliştirme sunucusu (Vite)  |
| `npm run build` | Production build            |
| `npm run preview` | Build sonrası önizleme   |

---

## Lisans ve telif

© 2026 NISSPY – Teknik & Akademik Başarı Asistanı

---

## Katkıda bulunma

Öneri ve katkılar için issue veya pull request açabilirsiniz.

