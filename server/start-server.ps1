# PowerShell script to start the server cleanly
# This script kills any existing Node.js processes and starts the server

Write-Host "🔄 Starting Koshiro Fashion Server..." -ForegroundColor Cyan

# Kill all Node.js processes
Write-Host "🧹 Cleaning up existing Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   Killing process PID: $($_.Id)" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Check if port 3000 is free
Write-Host "🔍 Checking port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":3000"
if ($portCheck) {
    Write-Host "   Port 3000 is still in use, waiting..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}

# Start the server
Write-Host "🚀 Starting server..." -ForegroundColor Green
npm run dev
