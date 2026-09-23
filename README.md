# GameBoost Academy

A full-stack gaming-course store where customers browse courses, buy them with **EFT (bank transfer)**, upload proof of payment, and get course access after an admin approves the payment.

- **Frontend:** React + TypeScript + Vite
- **Backend / database:** Supabase (PostgreSQL database, Authentication, Storage, Row Level Security)
- **Routing:** React Router
- **Deploy:** any static host that serves a Vite build (Vercel, Netlify, Cloudflare Pages)

> New to code? Read this file top to bottom once. Each section explains the *what* and the *why*, not just the commands.

---

## 1. What the website does

**For customers**

- Browse published courses on the home page
- Open a course page and see the price and details
- Create an account, log in, log out, and reset a forgotten password
- Add courses to a cart and create an EFT order
- Upload proof of payment for an order
- See their account, orders, and payment status
- Access purchased course content (including private lesson files) after approval

**For the admin**

- See business stats: total users, products, pending orders, paid orders, and revenue
- Add, edit, archive/publish, and delete products
- Add lessons and upload private lesson files
- See customer orders and open payment proofs
- Approve or reject EFT payments (approval automatically grants course access)

---

## 2. How the money flow works (EFT)

There is **no online payment gateway**. Payment is by **EFT / bank transfer**, reviewed manually:

1. Customer picks a course and creates an order (status `pending_payment`).
2. Customer pays into your bank account using the order number as a reference.
3. Customer uploads proof of payment → order status becomes `proof_submitted`.
4. Admin opens the proof, then **Approves** or **Rejects**.
5. On approval, the order becomes `paid` and the customer is granted `course_access` automatically.

**Security rule that never changes:** the customer can **never** mark their own order as paid. Only an admin can approve a payment, and the database enforces this (see Section 7).

---

## 3. Requirements (what to install first)

| Tool | What it is | Why you need it | Check it works |
|---|---|---|---|
| **Node.js** (LTS) | Runs JavaScript outside a browser | Builds and runs the project | `node -v` |
| **npm** | Installs project libraries | Comes with Node.js | `npm -v` |
| **Git** | Tracks changes to your files | Save/undo history, deploy | `git -v` |
| **VS Code** | Your code editor | Edit the project | opens from Start menu |

You also need a free **Supabase** account (Section 6) and a free **GitHub** account (Section 10).

---

## 4. Run it locally

Open a terminal **in the project folder**, then:

```bash
npm install
```

This downloads every library the project needs into a `node_modules` folder. Run it once (and again whenever `package.json` changes).

```bash
npm run dev
```

This starts a local web server with **live reload** (save a file → the browser updates). Open the address it prints, normally <http://localhost:5173>.

Other useful commands:

```bash
npm run build    # creates a production build in the dist/ folder
npm run preview  # preview the production build locally
npm run lint     # check the code for common mistakes
```

To stop the dev server, click the terminal and press `Ctrl + C`.

---

## 5. Folder structure

```
ikka/
├── public/                 # files served as-is (favicon, _redirects for Netlify)
├── src/
│   ├── components/         # reusable pieces
│   │   ├── Header.tsx         # top navigation bar
│   │   ├── Footer.tsx         # site footer
│   │   ├── AuthModal.tsx      # login / signup / reset popup
│   │   └── CartDrawer.tsx     # sliding cart panel
│   ├── data/
│   │   └── site.ts            # fixed content: benefits, FAQs, images, modes
│   ├── lib/
│   │   └── supabase.ts        # creates the Supabase client from env vars
│   ├── types/
│   │   └── index.ts           # TypeScript "shapes" for our data
│   ├── App.tsx                # the app: pages, state, and business logic
│   ├── App.css                # main styles
│   ├── index.css              # global styles
│   └── main.tsx               # entry point (mounts React + Router)
├── supabase/
│   ├── schema.sql             # creates all tables
│   ├── auth-setup.sql         # profile auto-create, is_admin() helper
│   ├── rls.sql                # security rules + storage buckets
│   └── reset-test-data.sql    # wipes test orders (keeps users/products)
├── vercel.json                # deploy config for Vercel
├── netlify.toml               # deploy config for Netlify
├── .env.example               # template for your secret-free settings
└── README.md
```

**Why this shape?** Pages and logic live in `App.tsx`; anything reused in many places (header, footer, popups) lives in `components/`. Content that never changes at runtime lives in `data/`. Shared data shapes live in `types/`. That keeps each file small and easy to reason about.

---

## 6. Supabase setup (the backend)

Supabase gives us the database, logins, and file storage. You set it up once.

1. Go to <https://supabase.com> and create an account.
2. Create a **new project**. Choose a name and a strong database password.
   - **Save that database password somewhere safe.** It is not needed by the website, but you'll want it for backups.
3. Wait for the project to finish provisioning.
4. In the left menu, open **Project Settings → API**.
5. Copy two values:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / publishable key** (a long public key)

### Public key vs secret key — read this carefully

| Key | Safe for the browser? | Use it for |
|---|---|---|
| **anon / publishable key** | ✅ Yes | The website. It can only do what your security rules allow. |
| **service_role / secret key** | ❌ **NEVER** | Server-only admin tasks. It bypasses all security rules. |

**Never put the service_role key in this project.** It would let anyone read and edit your entire database. The website only needs the public key.

---

## 7. Configure environment variables

Environment variables are settings kept **outside** the code, so secrets are never committed.

1. In the project root, make a copy of `.env.example` and name it `.env`.
2. Fill it in with your values from Section 6:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

3. Save the file and restart `npm run dev`.
4. Confirm `.env` is ignored by Git — it is already listed in `.gitignore`, so it will never be uploaded. If you ever see `.env` in `git status`, stop and fix `.gitignore` before committing.

The app reads these in `src/lib/supabase.ts`. If they are missing, the app still loads but shows a message that Supabase is not configured.

---

## 8. Create the database

In Supabase, open **SQL Editor**, then run these files **in this order**. Copy the whole file, paste it in, and click **Run**.

1. `supabase/schema.sql` — creates all tables, keys, and indexes.
2. `supabase/auth-setup.sql` — auto-creates a profile when someone signs up, and adds the `is_admin()` helper.
3. `supabase/rls.sql` — turns on Row Level Security, adds every policy, and creates the two private storage buckets.

`rls.sql` is written to be **safe to run again** after changes (it drops each policy before re-creating it), so you can re-run it any time you update security.

### The tables (and how they relate)

- **profiles** — one row per user (name, email, `role` = `user` or `admin`).
- **products** — the courses you sell (name, slug, price, status).
- **orders** — one row per checkout (`user_id`, `total_amount`, `status`).
- **order_items** — the products inside an order.
- **payment_proofs** — the uploaded proof for an order.
- **course_access** — which user owns which product (`status = active`).
- **course_lessons** — the lessons inside a product.
- **course_files** — private files attached to products.

Relationships, in plain words:

- One **user** can have many **orders**. One order contains one or more **products**.
- **Proof of payment** belongs to an order.
- **Course access** links a user to a product once payment is approved.
- A **product** has many **lessons**; a lesson can have a private **file**.

---

## 9. Create your administrator account

Admin power comes from the `profiles.role` column, **not** from the browser. To promote yourself:

1. Sign up on the website with your email.
2. In Supabase, open **SQL Editor** and run (with your real email):

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

3. **Log out and log in again** so the app reloads your new role. The admin dashboard will appear.

To remove admin rights, set `role = 'user'` the same way.

---

## 10. Git and GitHub (version control)

**Git** records snapshots (commits) of your project so you can undo mistakes. **GitHub** stores a copy online and connects to your deploy host.

First-time setup:

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"

git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Create an **empty** repository on GitHub (no README), then connect and push:

```bash
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

Day-to-day:

```bash
git status          # what changed
git add .           # stage all changes
git commit -m "Describe what you changed"
git push            # upload to GitHub
```

**Never commit** `.env`, passwords, or secret keys. `.gitignore` already blocks `.env` and `.env.*` (while keeping `.env.example`). If you ever commit a secret by mistake, treat it as leaked: rotate the key in Supabase immediately.

---

## 11. Deploy (put it online)

Full step-by-step, with screenshots-in-words, is in **[DEPLOYMENT.md](./DEPLOYMENT.md)**. The short version:

1. Push your code to GitHub (Section 10).
2. In **Vercel** (or Netlify), "Import" the GitHub repository.
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's dashboard.
4. Build command `npm run build`, output folder `dist` (already configured via `vercel.json` / `netlify.toml`).
5. Deploy, then update Supabase **Authentication → URL Configuration** with your live URL.
6. To update the site later: commit and push — the host rebuilds automatically.

---

## 12. Backups and recovery

- **Source code:** GitHub is your backup. Clone it on another machine with `git clone <url>` and you're back.
- **Database:** Supabase takes automatic daily backups (retention depends on plan). For extra safety, run occasional exports from the Supabase dashboard.
- **Deleted the wrong product?** Archive is safer than delete — archived products are hidden but kept. Deleting a product that has orders is blocked by the database on purpose.
- **Deleted code by accident?** Use `git log` to find the last good commit and `git checkout <commit> -- path/to/file` to restore just that file. Nothing is ever truly lost once committed.
- **Big changes:** work on a branch (`git checkout -b experiment`), and merge only when happy.

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Supabase is not configured" | `.env` missing/wrong | Recheck Section 7, restart the dev server |
| Blank page after deploy, refresh 404s | SPA rewrites missing | Keep `vercel.json` / `netlify.toml` / `public/_redirects` |
| Admin tools missing | Role not reloaded | Log out and back in; confirm the `update ... role='admin'` ran |
| Payment proof upload fails | Storage policy not applied | Re-run `supabase/rls.sql` |
| Cannot open a lesson file | Not purchased, or policy missing | Re-run `supabase/rls.sql`; check `course_access` |
| Login loop / email not arriving | Email provider limits | Configure a provider in Supabase **Authentication → Emails** |

Always fix errors by reading the message, finding the smallest cause, and re-testing — not by rewriting everything.

---

## 14. Scripts reference

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local dev server (live reload) |
| `npm run build` | Type-check and build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the linter |

---

© 2026 GameBoost Academy. Replace placeholder branding, text, and testimonials with your own before launch.