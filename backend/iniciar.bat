@echo off
echo ======================================
echo PlomApp Backend - Iniciando Servidor
echo ======================================
echo.

cd /d "%~dp0"

echo Verificando si las dependencias estan instaladas...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor...
call npm start

pause
