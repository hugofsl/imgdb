# Steps to Implement the Project on an External Server

## Prerequisites
1. Ensure you have Node.js and npm installed on your server.
2. Ensure you have PostgreSQL installed and running.
3. Ensure you have AWS S3 bucket and credentials set up.

## Steps

### 1. Clone the Repository
```sh
git clone <repository-url>
cd imgdb
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and add the following environment variables:
```
DATABASE_URL="postgresql://<username>:<password>@<host>/<database>"
AWS_ACCESS_KEY_ID="<your-aws-access-key-id>"
AWS_SECRET_ACCESS_KEY="<your-aws-secret-access-key>"
AWS_REGION="<your-aws-region>"
AWS_S3_BUCKET_NAME="<your-s3-bucket-name>"
PORT=3000
```

### 4. Set Up Prisma
1. Generate the Prisma client:
```sh
npx prisma generate
```
2. Apply the Prisma migrations to set up the database schema:
```sh
npx prisma migrate deploy
```

### 5. Build and Start the Server
1. Build the project:
```sh
npm run build
```
2. Start the server:
```sh
npm start
```

### 6. Configure Your Web Server
If you already have a website running, you need to configure your web server (e.g., Nginx, Apache) to proxy requests to the Node.js server running on port 3000.

#### Example Nginx Configuration
Add the following configuration to your Nginx configuration file:
```
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /existing-website {
        root /path/to/your/existing/website;
        index index.html;
    }
}
```

### 7. Access the Application
Open your browser and navigate to `http://yourdomain.com` to access the application.

### 8. Additional Notes
- Ensure your PostgreSQL database is accessible from the server.
- Ensure your AWS S3 bucket is properly configured to allow uploads and downloads.
- Monitor the server logs for any errors and troubleshoot as needed.

### 9. Security Considerations
- Ensure your `.env` file is not exposed publicly.
- Use secure credentials and rotate them regularly.
- Implement proper error handling and logging.

### 10. Maintenance
- Regularly update dependencies to keep the project secure.
- Backup your database and S3 bucket regularly.
- Monitor server performance and scale as needed.
