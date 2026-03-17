# 🚀 Deployment Guide

## Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `tap-rush`
3. Make it **Public** (required for GitHub Pages)
4. Click **Create repository**

### Step 2: Push the Code

Run these commands in your terminal:

```bash
cd /Users/nickhil/.openclaw/workspace/3d-avatar-world

# Add the remote repository
git remote add origin https://github.com/cryptoniknag/tap-rush.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/cryptoniknag/tap-rush
2. Click **Settings** tab
3. Scroll down to **Pages** section (or click "Pages" in the left sidebar)
4. Under "Source", select **GitHub Actions**
5. The deployment workflow will automatically run

### Step 4: Access Your Site

After the workflow completes (usually 1-2 minutes), your site will be live at:

**https://cryptoniknag.github.io/tap-rush/3d-avatars/**

### Step 5: Update the Path (if needed)

If you want the site at the root (`/`) instead of `/3d-avatars/`, edit `.github/workflows/deploy.yml`:

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './3d-avatar-world'  # Change this to just '.' if files are at root
```

And move the files to the root of the repository.

## Alternative: Manual Upload

If you prefer not to use Git:

1. Go to https://github.com/cryptoniknag/tap-rush/settings/pages
2. Select "Deploy from a branch"
3. Choose "main" branch and "/ (root)" folder
4. Upload files via GitHub web interface

## Troubleshooting

### Site not showing?
- Check that the repository is **Public**
- Verify GitHub Actions has permissions (Settings → Actions → General)
- Check the Actions tab for any deployment errors

### 404 errors?
- Make sure the `index.html` is at the root of the deployed folder
- Check the repository name matches your username (cryptoniknag.github.io/**tap-rush**)

### WebGL not working?
- Ensure you're using a modern browser
- Check that WebGL is enabled in browser settings
- Try accessing via HTTPS (required for WebGL)