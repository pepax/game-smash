# Static Browser Game Template

A minimal GitHub template repository for small browser-based games using **HTML + CSS + vanilla JavaScript**.

## What this template is for

Use this starter when you want to:

- Build a small game without frameworks
- Avoid any build or bundling step
- Deploy automatically with GitHub Pages
- Edit quickly (even from a smartphone)

## Project structure

```text
/
  index.html
  style.css
  app.js
  assets/
  .github/workflows/deploy.yml
  README.md
  LICENSE
```

## How to use this template

1. Click **Use this template** on GitHub.
2. Create your new repository.
3. Clone it locally (optional), or edit files directly on GitHub.
4. Replace placeholder game content in `index.html`, `style.css`, and `app.js`.

## Develop from your phone

You can build and ship updates without a computer:

1. Open your repository in a mobile browser or the GitHub app.
2. Edit `index.html`, `style.css`, or `app.js`.
3. Commit changes directly to `main`.
4. GitHub Actions deploys the site automatically.

Tip: Keep gameplay values and logic near the top of `app.js` so they are easy to tweak on a small screen.

## How deployment works

Deployment is handled by `.github/workflows/deploy.yml`:

- Triggers on every push to `main`
- Can also run manually with **workflow_dispatch**
- Uploads repository root as the Pages artifact
- Publishes using official GitHub Pages actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`)

Repository settings should use **GitHub Pages → Source: GitHub Actions**.

## Where your site will be available

After the first successful deployment, your game is typically available at:

```text
https://<your-username>.github.io/<your-repository-name>/
```

For organization repositories, replace `<your-username>` with your org name.

## Extend this template

- Put images/audio in `assets/`
- Add simple modules as extra `.js` files
- Keep everything static so deployment stays zero-config
