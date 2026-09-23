# Deployment Guide (beginner friendly)

This guide takes the GameBoost Academy project from your computer to a **live website** on the internet, using **GitHub + Vercel**. Netlify works almost identically (notes at the end).

The flow we will build:

```
VS Code  →  git commit  →  GitHub  →  Vercel  →  Live website
                                   ↑
                          Supabase stays the backend (database, auth, storage)
```

---

## 0. Words you should know first

| Word | Simple meaning |
|---|---|
| **Build** | Turning your source code into the final files a browser can run. We do this with `npm run build`, which outputs a `dist/` folder. |
| **Deploy / Host** | Putting those final files on a computer (the "host") that is always online, so anyone can visit. |
| **Environment variable** | A setting kept outside the code (like your Supabase URL and public key). Configured in the host's dashboard so you never hard-code secrets. |
| **Production** | The live, public version of the site (as opposed to `localhost` on your PC). |
| **SPA rewrites** | A rule that sends every web address back to `index.html`, so deep links like `/account` don't show a 404 when refreshed. Already set up for you. |

---

## 1. Before you deploy — checklist

Run these locally and make sure they pass:

```bash
npm run build
npm run lint
```

`build` must finish with `✓ built`, and `lint` must show `0 errors`.

Also confirm:

- [ ] Your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] `.env` is **not** in `git status` (it must be ignored).
- [ ] The database scripts (`schema.sql`, `auth-setup.sql`, `rls.sql`) have all been run in Supabase.
- [ ] You have created and tested an admin account.

---

## 2. Put the code on GitHub

If this is your first time:

```bash
git init
git add .
git commit -m "Ready to deploy"
git branch -M main
```

Create an **empty** repository on GitHub (do **not** tick "Add a README"), then:

```bash
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

Refresh the GitHub page — you should see all your files (and **no** `.env`).

---

## 3. Deploy with Vercel (recommended)

1. Go to <https://vercel.com> and sign in with GitHub.
2. Click **Add New… → Project**.
3. Under "Import Git Repository", find your repo and click **Import**.
4. Vercel detects Vite automatically:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - (These are also stated in `vercel.json`, so you usually don't need to touch them.)
5. Open **Environment Variables** and add **two** rows:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Project URL from Supabase |
   | `VITE_SUPABASE_ANON_KEY` | your public anon key |

   Use the **public** key only. Never add the service_role key.
6. Click **Deploy**. Wait about a minute.
7. You'll get a live address like `https://your-project.vercel.app`.

**Why environment variables?** The build needs your Supabase settings, but they should not live in the code. The host injects them at build time, so the public site gets them while your repository stays clean.

---

## 4. Point Supabase at your live site

Logins and password-reset links only work on addresses you allow.

1. Supabase → **Authentication → URL Configuration**.
2. Set **Site URL** to your live address, e.g. `https://your-project.vercel.app`.
3. Under **Redirect URLs**, add:
   - `https://your-project.vercel.app/account`
   - `https://your-project.vercel.app/**`
4. **Save**.

Now sign up / log in on the live site to confirm it works.

---

## 5. Updating the live site later

Every time you change code:

```bash
git add .
git commit -m "Describe the change"
git push
```

Vercel detects the push and **rebuilds automatically**. After a minute or two, refresh your site — your change is live. You never upload files by hand.

---

## 6. Checking deployment logs (and fixing a failed build)

1. In Vercel, open your project → **Deployments**.
2. Click the newest deployment → **Building** / **Logs**.
3. Scroll to the first red error. Common causes:

| Error in the log | Meaning | Fix |
|---|---|---|
| `Command "npm run build" exited with 1` | TypeScript or build error | Run `npm run build` locally; fix the first error it prints |
| `Cannot find module '...'` | A library isn't in `package.json` | Run `npm install <name>` locally, commit `package.json` + lock file |
| Missing env var at runtime | Env vars not set in Vercel | Add them in **Settings → Environment Variables**, then redeploy |
| 404 on refresh of `/account` | SPA rewrites missing | Keep `vercel.json` in the repo root |

After fixing, commit and push again — Vercel retries automatically.

---

## 7. Custom domain (later)

A **domain** is your web address (e.g. `gameboostacademy.co.za`).

1. Buy a domain from a registrar (e.g. Namecheap, GoDaddy, or a local provider).
2. In Vercel → your project → **Settings → Domains**, click **Add** and type your domain.
3. Vercel shows the **DNS records** to add. **DNS** is the internet's address book that points your domain at a server.
   - If your registrar asks for **nameservers**, use the ones Vercel gives you (easiest).
   - Otherwise add the records it shows (usually an `A` record for the root and a `CNAME` for `www`).
4. Wait — DNS changes can take from a few minutes up to ~24 hours to spread worldwide.
5. Once active, return to Supabase **Authentication → URL Configuration** and add your new domain to Site URL and Redirect URLs.

**Do not change DNS records** until you have bought the domain and Vercel has told you exactly which records to set.

---

## 8. Deploying with Netlify instead

1. <https://netlify.com> → sign in with GitHub → **Add new site → Import an existing project**.
2. Pick your repo.
3. Build command `npm run build`; publish directory `dist` (also set in `netlify.toml`).
4. Add the same two environment variables.
5. Deploy. Then repeat Section 4 with your Netlify address.

`netlify.toml` and `public/_redirects` already handle SPA rewrites.

---

## 9. Post-launch safety checklist

- [ ] The `.env` file is **not** on GitHub.
- [ ] Only the **public** Supabase key is in the host's env vars.
- [ ] You can sign up, log in, place an order, upload a proof.
- [ ] As admin, you can approve the order and the customer gains access.
- [ ] Refreshing a deep link (e.g. `/account`) does **not** 404.
- [ ] Password reset email arrives (configure a provider in Supabase **Authentication → Emails** for reliability).

---

## 10. One-line summary

> Edit code in VS Code → `git commit` → `git push` → GitHub → Vercel rebuilds → live website updates. Supabase keeps running the database, logins, and file storage behind it all.