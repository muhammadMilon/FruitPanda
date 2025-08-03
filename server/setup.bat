@echo off
echo ========================================
echo Fruit Panda Server Setup
echo ========================================
echo.

echo 1. Installing dependencies...
npm install

echo.
echo 2. Checking MongoDB...
echo Please make sure MongoDB is installed and running.
echo You can download MongoDB from: https://www.mongodb.com/try/download/community
echo.

echo 3. Starting the server...
echo The server will start on http://localhost:5000
echo.
echo If you see MongoDB connection errors, please:
echo - Install MongoDB Community Server
echo - Start MongoDB service: net start MongoDB
echo - Or run MongoDB manually
echo.

npm run server:dev

pause 