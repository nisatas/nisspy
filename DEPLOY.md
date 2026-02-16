# CoachFlow – Canlı Yayın ve Deploy Rehberi

Bu rehber, projeyi **giriş/çıkış** ve **verilerin saklanması** ile GitHub’a atıp canlı kullanmak için gereken adımları anlatır.

## 1. Supabase Kurulumu (Giriş + Veri Saklama)

1. [supabase.com](https://supabase.com) → **Start your project** → GitHub ile giriş yapın.
2. **New project** ile yeni proje oluşturun (ör. `coachflow`).
3. **Project Settings** (sol menü) → **API** bölümünde:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
4. **SQL Editor** → **New query** açın, aşağıdaki SQL’i yapıştırıp **Run** ile çalıştırın:

```sql
create table if not exists public.user_schedules (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schedule jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_schedules enable row level security;

create policy "Users can read own schedule"
  on public.user_schedules for select using (auth.uid() = user_id);
create policy "Users can insert own schedule"
  on public.user_schedules for insert with check (auth.uid() = user_id);
create policy "Users can update own schedule"
  on public.user_schedules for update using (auth.uid() = user_id);
create policy "Users can delete own schedule"
  on public.user_schedules for delete using (auth.uid() = user_id);
```

5. **Authentication** → **Providers** içinde **Email** açık olsun (varsayılan açıktır).

6. **Profil ve avatar** için SQL Editor’da ayrıca şu sorguyu çalıştırın (veya **frontend/supabase/schema.sql** dosyasının tamamını kopyalayıp çalıştırın; içinde `profiles` tablosu da var).

7. **Storage**: Sol menüden **Storage** → **New bucket** → isim: `avatars`, **Public bucket** işaretli olsun. Oluşturduktan sonra bucket’a tıklayın → **Policies** → **New policy** → “For full customization” ile şu politikayı ekleyin: **Allow authenticated users to upload** (INSERT) ve **Allow public read** (SELECT). Böylece kullanıcılar kendi fotoğraflarını yükleyebilir.

---

## 2. Yerel Ortamda Çalıştırma

1. Proje kökündeki `.env.example` dosyasını **frontend/.env.local** olarak kopyalayın (veya `.env.example`’ı kopyalayıp `.env.local` yapın).
2. `frontend/.env.local` içine yazın:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Uygulamayı başlatın (frontend klasöründen):

```bash
cd frontend
npm install
npm run dev
```

4. Tarayıcıda **Kayıt ol** ile yeni hesap oluşturup giriş yapın. Haftalık planınız otomatik kaydedilir.

---

## 3. GitHub’a Yükleme

1. [github.com](https://github.com) → **New repository** (ör. `coachflow`).
2. Proje klasöründe (klasör adında `&` varsa önce `academic-technical-productivity-coach` gibi bir isimle kopyalayıp o klasörde çalışmak daha sorunsuz olur):

```bash
git init
git add .
git commit -m "CoachFlow: auth + Supabase + deploy hazır"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/coachflow.git
git push -u origin main
```

---

## 4. Vercel ile Canlı Deploy

1. [vercel.com](https://vercel.com) → GitHub ile giriş → **Add New** → **Project**.
2. Repoyu seçin (ör. `coachflow`) → **Import**.
3. **Root Directory** olarak **frontend** seçin (Build ayarlarında).
4. **Environment Variables** kısmına ekleyin:
   - `VITE_SUPABASE_URL` = Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase anon key
   - İsteğe bağlı: `GEMINI_API_KEY` (Coach sohbeti için)
5. **Deploy** ile yayına alın.
6. Bitince **Visit** ile canlı siteyi açın. Artık kayıt/giriş yapıp planınız kaydedilir.

**Not:** Her `main` branch’e push’ta Vercel otomatik yeniden deploy eder.

---

## 5. Özet

| Adım | Ne yapıyorsunuz? |
|------|-------------------|
| Supabase | Proje + `user_schedules` tablosu + Auth (Email) |
| frontend/.env.local | `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` |
| GitHub | Repo oluşturup kodu push’lamak |
| Vercel | Repo’yu bağlayıp aynı env değişkenlerini ekleyip deploy |

Bunları yaptıktan sonra site canlı çalışır; kullanıcılar giriş yapıp haftalık planlarını kalıcı olarak kullanabilir.
