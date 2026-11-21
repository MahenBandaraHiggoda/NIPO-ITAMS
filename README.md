# NIPO-ITAMS

NIPO IT Asset Management System. The current version is a Next.js starter with an Appwrite connection demo.

## Before you start

- Install Git.
- Install Node.js 24 LTS, which includes npm. Run `node --version` to check your installation.
- Use pnpm 12. If `pnpm --version` says the command is missing, install pnpm with npm:

  ```sh
  npm install --global pnpm@12
  pnpm --version
  ```

  If the terminal still can't find pnpm after installation, close and reopen it, then try `pnpm --version` again.

## Run locally

Open PowerShell or your terminal and run these commands one at a time:

```sh
git clone --branch Initial https://github.com/MahenBandaraHiggoda/NIPO-ITAMS.git
cd NIPO-ITAMS
pnpm install
pnpm dev
```

If you've already cloned the repository, open a terminal in the `NIPO-ITAMS` folder and start with `pnpm install`. After the first install, use `pnpm dev` each time you want to work on the app.

Open [http://localhost:3000](http://localhost:3000). If Next.js picks another port, use the **Local** URL printed in the terminal. Keep the terminal open while the app is running. Press **Ctrl+C** to stop the server.

## Check the Appwrite connection

Click **Send a ping** on the home page. A successful connection displays a confirmation and an HTTP `200` entry in **Logs**.

The demo comes configured for the **NIPO Inventory Management System** Appwrite project in [`src/lib/appwrite.js`](src/lib/appwrite.js), so you can run it without creating an environment file. If the page loads but the ping fails, check your internet connection and try again. If you're using your own Appwrite project, update the endpoint, project ID, and project name in that file and register `localhost` as a web platform in your Appwrite project.

## Run a production build locally

Stop the dev server first if it's still running, then run:

```sh
pnpm build
pnpm start
```

Open the **Local** URL printed by `pnpm start`.
