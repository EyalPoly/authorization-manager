# 🔐 Authorization Manager

This service handles secret configuration for the AttendMe project. It loads secrets securely from **Google Secret Manager** using a **GCP Service Account**.

---

## 📦 Prerequisites

Before running this service, make sure you have the following:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- Access to a [Google Cloud Platform](https://cloud.google.com/) project
- A **GCP Service Account** with access to Secret Manager
- A `.env` file (see below)
- A local copy of the **Service Account Key JSON** file

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following values:

```env
# Used to construct the secret name (e.g., jwtSecret-JWT_SECRET)
JWT_SECRET_NAME_POSTFIX=

# Your GCP project ID
GOOGLE_CLOUD_PROJECT_ID=

# Path to the downloaded service account key
GOOGLE_APPLICATION_CREDENTIALS=

# Set to 'production' when running in production
NODE_ENV="DEV"
