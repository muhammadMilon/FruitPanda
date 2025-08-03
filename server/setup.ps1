Write-Host "========================================" -ForegroundColor Green
Write-Host "Fruit Panda Server Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "2. Checking MongoDB..." -ForegroundColor Yellow
Write-Host "Please make sure MongoDB is installed and running." -ForegroundColor Cyan
Write-Host "You can download MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Starting the server..." -ForegroundColor Yellow
Write-Host "The server will start on http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "If you see MongoDB connection errors, please:" -ForegroundColor Red
Write-Host "- Install MongoDB Community Server" -ForegroundColor Red
Write-Host "- Start MongoDB service: net start MongoDB" -ForegroundColor Red
Write-Host "- Or run MongoDB manually" -ForegroundColor Red
Write-Host ""

npm run server:dev 