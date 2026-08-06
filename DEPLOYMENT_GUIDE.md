# Star Educational Academy — Full Deployment Guide (Free Tier)

This guide provides a comprehensive, step-by-step walkthrough to deploy the Star Academy MERN stack platform completely for **free** using **MongoDB Atlas** (Database), **Render** (Backend API), and **Vercel** (Frontend React App).

---

## 🛠️ PHASE 1: Database Setup (MongoDB Atlas)

We will host the database on MongoDB Atlas using their free M0 cluster.

1. **Create an Account:**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for a free account.
2. **Create a Cluster:**
   - Click **"Build a Database"**.
   - Select the **"M0 Free"** plan.
   - **Provider:** AWS.
   - **Region:** Select a region closest to you or your target audience (e.g., `Mumbai` or `Frankfurt`).
   - Click **"Create Cluster"**.
3. **Configure Security (Crucial Step):**
   - **Authentication:** You will be prompted to create a Database User.
     - **Username:** `admin` (or any name you prefer).
     - **Password:** Click "Autogenerate Secure Password" (Copy this password! You will need it later).
     - Click **"Create User"**.
   - **Network Access:** You will be prompted to set up IP Access.
     - Select **"Allow Access from Anywhere"** (this sets IP to `0.0.0.0/0`). This is necessary because Render's backend IP addresses change dynamically.
     - Click **"Add IP Address"**.
4. **Get Connection String:**
   - Go to the **"Database"** section on the left sidebar.
   - Click the **"Connect"** button next to your cluster.
   - Select **"Connect your application"** (Drivers).
   - Copy the connection string. It will look something like this:
     `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **Note:** Replace `<password>` with the secure password you copied in Step 3. Keep this URL safe!

---

## ⚙️ PHASE 2: Backend Deployment (Render)

We will deploy the Node.js/Express server on Render's free Web Service tier.

1. **Prepare Your Code for GitHub:**
   - Ensure your entire project (both client and server) is pushed to a repository on your GitHub account.
2. **Create a Render Account:**
   - Go to [render.com](https://render.com) and sign up using your GitHub account.
3. **Create a New Web Service:**
   - Click **"New +"** at the top right and select **"Web Service"**.
   - Connect your GitHub account and select the `Star` repository.
4. **Configure the Web Service:**
   - **Name:** `star-academy-api` (or similar).
   - **Region:** Select the same region you chose for MongoDB Atlas (e.g., Frankfurt/EU).
   - **Branch:** `main` (or whichever branch your code is on).
   - **Root Directory:** Type `server` (This is extremely important since your backend is in the `/server` folder).
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. **Set Environment Variables:**
   - Scroll down to **"Advanced"** and click **"Add Environment Variable"**. Add the following:
     - `PORT` = `5000`
     - `NODE_ENV` = `production`
     - `MONGO_URI` = *(Paste your MongoDB Atlas connection string here)*
     - `JWT_SECRET` = *(Generate a long, random string. e.g., `sT@rAc4d3my$ecr3tK3y2026!`)*
     - `GEMINI_API_KEY` = *(Paste your Google AI Studio API key here for the AI services)*
     - `CLIENT_URL` = *(Leave blank for now. We will update this after deploying Vercel).*
     - `RENDER_EXTERNAL_URL` = *(Leave blank for now. Will be updated automatically or you can paste the Render URL here to activate the 13-minute keep-alive ping).*
6. **Deploy:**
   - Click **"Create Web Service"**. Render will now build and start your server.
   - Once it says "Live", copy the Render URL at the top left (e.g., `https://star-academy-api.onrender.com`).

---

## 💻 PHASE 3: Frontend Deployment (Vercel)

We will deploy the Vite/React frontend on Vercel's edge network for lightning-fast speeds.

1. **Update Backend URL in Frontend:**
   - Vercel automatically creates a production build. You must tell your React app where the Render backend lives.
2. **Create a Vercel Account:**
   - Go to [vercel.com](https://vercel.com) and sign up using your GitHub account.
3. **Import Project:**
   - Click **"Add New..."** -> **"Project"**.
   - Import your `Star` repository from GitHub.
4. **Configure Project Settings:**
   - **Project Name:** `star-educational-academy`
   - **Framework Preset:** Vercel should automatically detect **Vite**.
   - **Root Directory:** Click "Edit" and select the `client` folder.
   - **Build and Output Settings:** Leave as default (Build command: `npm run build`, Output directory: `dist`).
5. **Set Environment Variables:**
   - Expand the **"Environment Variables"** dropdown and add:
     - `VITE_API_URL` = *(Paste your Render backend URL here, e.g., `https://star-academy-api.onrender.com/api` - Do not include a trailing slash!)*
6. **Deploy:**
   - Click **"Deploy"**.
   - Wait 2-3 minutes for Vercel to build your React app.
   - Once finished, Vercel will give you a public URL (e.g., `https://star-educational-academy.vercel.app`).

---

## 🔗 PHASE 4: Final Connection (The Loop)

Now that Vercel is live, you must give the backend permission to accept requests from it (CORS).

1. **Update Render Environment Variables:**
   - Go back to your Render Dashboard -> Your Web Service -> **"Environment"** tab.
   - Find the `CLIENT_URL` variable you left blank earlier.
   - Paste your new Vercel URL (e.g., `https://star-educational-academy.vercel.app`).
   - Click **"Save Changes"**. Render will automatically restart your server with the new settings.
2. **Setup Initial Admin Account (Optional but recommended):**
   - Go to your live Vercel website.
   - Register a new account.
   - Since you are the first user, you can either manually change your role to `admin` directly inside MongoDB Atlas (via the "Browse Collections" interface) or use any backdoor scripts you have built.

---

## 🚨 Troubleshooting & Important Notes

- **Render Sleep Mode (Resolved):** Render's free tier usually "sleeps" after 15 minutes of inactivity. To prevent this, I have written a custom script in `server.js` that automatically pings the server every 13 minutes. To activate it, simply ensure your `RENDER_EXTERNAL_URL` environment variable is set to your live Render URL (e.g., `https://star-academy-api.onrender.com`).
- **Routing Issues on Vercel:** Because it is a React Single Page Application (SPA), if you refresh a page other than the home page and get a `404 Not Found` error on Vercel, you need to create a `vercel.json` file inside your `/client` directory with the following code to handle client-side routing:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Vercel Build Logs:** If Vercel fails to deploy, click on the failed deployment and read the "Build Logs". It is usually caused by unused variables or syntax errors in React that Vite strictly enforces.

Congratulations! Your SaaS platform is now live and professionally deployed on the cloud!
