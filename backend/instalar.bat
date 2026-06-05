@echo off
echo ======================================
echo PlomApp Backend - Script de Instalacion
echo ======================================
echo.

REM Ir a la carpeta backend
cd /d "%~dp0"

echo Instalando dependencias...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ===================================
    echo Instalacion completada exitosamente
    echo ===================================
    echo.
    echo Para iniciar el servidor, ejecuta:
    echo npm start
    echo.
    pause
) else (
    echo.
    echo Error durante la instalacion. Por favor, intenta nuevamente.
    pause
)
