# Node.js CI/CD Demo

This small project is a hands-on example of **Continuous Integration (CI)**,
Docker, GitHub Actions, and **Continuous Deployment (CD)** to Render.

## 1. What you are building

- `app.js` is an Express web server.
- `/` displays a greeting.
- `/health` returns `{"status":"ok"}` so a platform can check the service.
- `app.test.js` tests both endpoints with Node.js's built-in test runner.
- The Docker image packages the application in a repeatable environment.
- GitHub Actions runs tests and builds the image on every push.
- A successful push to `main` triggers Render through a secret deploy hook.

CI checks that a change is safe to integrate. CD automatically delivers a
successful change to the hosting environment. In this project, CI is the
`ci` job and CD is the `cd` job. The `needs: ci` setting means CD cannot run
unless CI succeeds.

## 2. Folder structure

```text
github-actions-docker-demo/
├── .dockerignore
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── app.js
├── app.test.js
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

`package-lock.json` is generated from `package.json`. Do not write it by hand.
After creating `package.json`, run:

```powershell
npm install
```

Commit the generated lock file. CI uses `npm ci`, which installs exactly what
the lock file records and fails if the two package files disagree.

## 3. Run it locally

Install Node.js 20 or newer, then from this folder run:

```powershell
npm install
npm test
npm start
```

Open <http://localhost:3000/> and
<http://localhost:3000/health>. Stop the server with `Ctrl+C`.

The `PORT` environment variable is used by Render and Docker. For example:

```powershell
$env:PORT=4000
npm start
```

## 4. Build and run Docker

Install Docker Desktop and make sure Docker is running:

```powershell
docker build -t github-actions-docker-demo .
docker run --rm -p 3000:3000 github-actions-docker-demo
```

The first command creates an image. The second maps your computer's port 3000
to the container's port 3000. Test the container at
<http://localhost:3000/health>. Stop it with `Ctrl+C`.

The Dockerfile copies dependency manifests first so Docker can reuse its
dependency layer. `.dockerignore` prevents local dependencies and Git metadata
from entering the image.

## 5. Create the GitHub repository and push

1. Sign in to GitHub and choose **New repository**.
2. Name it, for example, `github-actions-docker-demo`.
3. Keep it empty: do not add a README, `.gitignore`, or license because this
   project already has its own README.
4. In this folder, generate the lock file and initialize Git:

```powershell
npm install
git init
git add .
git commit -m "Build Node.js CI/CD demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/github-actions-docker-demo.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Git may ask you to sign in.
Never put a password, token, or deploy-hook URL in a source file.

## 6. Configure Render and the GitHub secret

Render's free web-service availability, limits, and sleep behavior can change,
so confirm the current free-tier terms in Render's pricing documentation.

1. Sign in to Render and choose **New > Web Service**.
2. Connect the GitHub repository and select the `main` branch.
3. Choose Docker as the runtime. Render will use this repository's
   `Dockerfile`.
4. Choose the available free instance option, set the service port to `3000`
   if Render asks for one, and create the service.
5. In the Render service, open **Settings > Deploy Hook**, create a hook, and
   copy its URL. Treat this URL like a password.
6. In GitHub, open the repository's **Settings > Secrets and variables >
   Actions > New repository secret**.
7. Set the name to exactly `RENDER_DEPLOY_HOOK_URL`, paste the Render URL as
   the value, and save it.

The workflow never prints the URL. It reads it as
`${{ secrets.RENDER_DEPLOY_HOOK_URL }}`. If your Render account does not show a
free option, use an available plan or another hosting service; the CI portion
still works.

## 7. Understand each workflow trigger

- A push to any branch runs CI.
- A pull request targeting `main` runs CI.
- A push to `main` runs CI first. Only when CI passes does the `cd` job send a
  POST request to the Render deploy hook.
- A failed test or Docker build prevents deployment.

After changing code:

```powershell
git add .
git commit -m "Describe the change"
git push
```

On GitHub, open the **Actions** tab, select **CI and CD**, and open the latest
run. Green check marks mean the corresponding steps passed. After a successful
`main` run, check the Render service's **Events** or **Logs** page and open its
public URL.

## 8. Troubleshooting

### Tests fail locally

- Confirm Node.js is installed with `node --version`.
- Run `npm install` if `node_modules` is missing.
- Run `npm test` again and read the first assertion failure.
- If a server is already using port 3000, stop that process or set another
  `PORT` for `npm start`. The tests use an automatically selected free port.

### Docker build fails

- Confirm Docker Desktop is running with `docker info`.
- Run the command from the folder containing `Dockerfile` and `package-lock.json`.
- Run `npm install` to regenerate a current lock file, then retry.
- Read the first Docker error; later errors are often consequences of it.

### GitHub Actions fails

- Open the failed job and expand the red step.
- `npm ci` failures usually mean the lock file is missing or does not match
  `package.json`; run `npm install` and commit both files.
- Test failures should also be reproduced locally with `npm test`.
- Docker errors should be reproduced locally with `docker build -t test-image .`.
- Make sure the workflow file is exactly under `.github/workflows/`.

### Render does not deploy

- Confirm the service is connected to the intended repository and `main`
  branch.
- Confirm the secret name is exactly `RENDER_DEPLOY_HOOK_URL`; secret values
  are case-sensitive.
- If the hook was exposed, delete it in Render and create a new one, then
  update the GitHub secret.
- Check the Render Events and Logs pages for build, port, or runtime errors.
- Confirm the app listens on `process.env.PORT` and that the Render service
  uses the Docker runtime.

## 9. Final online checklist

- [ ] `npm test` passes locally.
- [ ] `docker build -t github-actions-docker-demo .` succeeds.
- [ ] The repository contains the workflow under `.github/workflows/`.
- [ ] The first GitHub Actions CI run is green.
- [ ] Render has a running web service using the repository's Dockerfile.
- [ ] The `RENDER_DEPLOY_HOOK_URL` GitHub secret exists.
- [ ] A push to `main` shows both CI and CD as successful.
- [ ] `https://YOUR-RENDER-URL/` displays the greeting.
- [ ] `https://YOUR-RENDER-URL/health` returns `{"status":"ok"}`.
