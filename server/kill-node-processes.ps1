# PowerShell script to kill all Node.js processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow

# Get all Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes:" -ForegroundColor Cyan
    
    foreach ($process in $nodeProcesses) {
        Write-Host "   Killing process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction Stop
            Write-Host "   Successfully killed PID: $($process.Id)" -ForegroundColor Green
        } catch {
            Write-Host "   Failed to kill PID: $($process.Id) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Check if any processes are still running
    $remainingProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($remainingProcesses) {
        Write-Host "Warning: $($remainingProcesses.Count) Node.js processes are still running" -ForegroundColor Yellow
        $remainingProcesses | ForEach-Object {
            Write-Host "   Still running: PID $($_.Id)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "All Node.js processes have been terminated" -ForegroundColor Green
    }
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

Write-Host "Checking port 3000..." -ForegroundColor Cyan
$portCheck = netstat -ano | findstr ":3000"
if ($portCheck) {
    Write-Host "Port 3000 is still in use:" -ForegroundColor Yellow
    Write-Host $portCheck -ForegroundColor Yellow
} else {
    Write-Host "Port 3000 is now free" -ForegroundColor Green
}

Write-Host "Ready to start server!" -ForegroundColor Green
