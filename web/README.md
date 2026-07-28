# GLZ Radio Web

Installable browser version of GLZ Radio, designed for static deployment on
Vercel. Station audio is requested directly from each broadcaster; Vercel does
not relay the audio.

## Local development

```powershell
cd web
npm install
npm run dev
```

## Production build

```powershell
cd web
npm install
npm run build
```

The build output is written to `web/dist`.

## Deploy with Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import `yadielglz/glz-radio`.
3. Set **Root Directory** to `web`.
4. Keep the detected framework preset (**Vite**) and deploy.
5. Test the generated `vercel.app` URL.
6. Open **Project → Settings → Domains** and add `radio.glztech.com`.
7. Copy the exact CNAME target that Vercel displays.
8. In Cloudflare DNS, replace the broken `radio` record with:
   - Type: `CNAME`
   - Name: `radio`
   - Target: the exact Vercel target
   - Proxy status: **DNS only** (gray cloud)
   - TTL: Auto
9. Wait until Vercel reports **Valid Configuration**, then test
   `https://radio.glztech.com`.

Do not change the nameservers for `glztech.com`; only the `radio` record needs
to change.

## Browser limitations

Browsers block plain-HTTP audio on an HTTPS page. The current Radio Once and La
X catalog entries therefore show a clear message instead of attempting mixed
content. Their web playback requires replacement HTTPS stream URLs.

Android Auto, native APK updates, native background services, and native stream
recording are intentionally not part of the web version.
