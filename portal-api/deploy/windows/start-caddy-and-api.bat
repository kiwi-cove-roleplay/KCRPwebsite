@echo off
REM Starts Caddy (reverse proxy, port 443) and portal-api (port 30130) on the
REM game-server box, each in its own titled console window so you can see
REM immediately if either one fails to start instead of it dying silently in
REM the background. Ctrl+C in a window (or just close it) stops that process.
REM
REM Edit the three paths below for this box, then just double-click this file
REM (or run it from a cmd prompt) whenever both need to come back up.

setlocal

REM --- EDIT THESE FOR THIS BOX -------------------------------------------
set "CADDY_EXE=caddy.exe"
set "CADDYFILE=C:\Caddy\Caddyfile"
set "PORTAL_API_DIR=C:\Users\Administrator\Desktop\portal-api"
REM ------------------------------------------------------------------------

echo.
echo === Checking for existing listeners (avoid double-starting) ===
netstat -ano | findstr :443 >nul
if %errorlevel%==0 (
    echo Something is already listening on :443 - Caddy may already be running.
    echo   netstat -ano ^| findstr :443
    echo Skipping Caddy start. Close it first if you want to restart it.
) else (
    echo Starting Caddy...
    start "Caddy (:443)" cmd /k ""%CADDY_EXE%" run --config "%CADDYFILE%""
)

netstat -ano | findstr :30130 >nul
if %errorlevel%==0 (
    echo Something is already listening on :30130 - portal-api may already be running.
    echo   netstat -ano ^| findstr :30130
    echo Skipping portal-api start. Close it first if you want to restart it.
) else (
    echo Starting portal-api...
    REM If you installed portal-api as a Windows Service (pnpm service:install),
    REM use "net start sfos-portal-api" instead of the line below - running both
    REM the service AND this would fight over port 30130.
    start "portal-api (:30130)" cmd /k "cd /d "%PORTAL_API_DIR%" && node dist\index.js"
)

echo.
echo Waiting for both to come up...
timeout /t 4 /nobreak >nul

echo.
echo === Health check ===
echo -- portal-api (local) --
curl -s http://127.0.0.1:30130/health
echo.
echo -- through Caddy (public) --
curl -s https://api.kcrp.nz/health
echo.
echo.
echo If either line above is empty/errored, check that process's console window for the actual error.

endlocal
