# Deploy Script Setup (one-time)

Run these steps once to enable the deploy.sh script.

## Step 1. Make the script executable

Open Terminal (Applications, Utilities, Terminal). Run:

    cd /Users/dan/Documents/music-city-retreat-chatbot
    chmod +x deploy.sh

## Step 2. Install GitHub CLI for easy authentication

In Terminal, run:

    brew install gh

If you do not have Homebrew, install it first from https://brew.sh

After gh is installed, authenticate:

    gh auth login

Choose:
- GitHub.com
- HTTPS
- Login with web browser
- A browser window opens. Confirm the one-time code and authorize.

## Step 3. Run deploy for the first time

    ./deploy.sh

The script will:
- Initialize git in the project folder
- Connect to your GitHub repo
- Pull the latest files
- Stage your local changes
- Commit with a timestamp
- Push to GitHub
- Vercel auto-deploys

## Daily use after setup

Anytime you want to push your local changes live:

    cd /Users/dan/Documents/music-city-retreat-chatbot
    ./deploy.sh

Or with a custom commit message:

    ./deploy.sh "added weather button"

## Troubleshooting

If you see "permission denied" when running deploy.sh, redo step 1.

If push fails with authentication errors, re-run gh auth login.

If you get merge conflicts, that means GitHub has changes your local copy
does not. Open Terminal, cd into the project, and run:

    git status
    git pull origin main

Resolve any conflicts manually, then re-run deploy.sh.
