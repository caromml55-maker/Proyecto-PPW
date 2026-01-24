@echo off
REM Script para verificar si el backend está respondiendo

echo Probando conexión al backend...
echo.

REM Prueba GET - buscar usuario que no existe (debe retornar 404)
echo ========================================
echo Test 1: GET /api/user/test123 (debe retornar 404)
echo ========================================
curl -v -X GET "http://localhost:8080/gproyectoFinal/api/user/test123" 2>&1 | findstr "HTTP\|Connection\|error"
echo.
echo.

REM Prueba POST - crear usuario
echo ========================================
echo Test 2: POST /api/user (debe crear usuario)
echo ========================================
curl -v -X POST "http://localhost:8080/gproyectoFinal/api/user" ^
  -H "Content-Type: application/json" ^
  -d "{\"uid\":\"test-firebase-123\",\"displayName\":\"Test User\",\"email\":\"test@example.com\",\"photoURL\":\"\",\"role\":\"user\",\"createdAt\":\"2024-01-21\"}" 2>&1 | findstr "HTTP\|Connection\|error\|uid"
echo.
echo.

REM Prueba GET - buscar usuario que acaba de crear (debe retornar 200)
echo ========================================
echo Test 3: GET /api/user/test-firebase-123 (debe retornar 200)
echo ========================================
curl -v -X GET "http://localhost:8080/gproyectoFinal/api/user/test-firebase-123" 2>&1 | findstr "HTTP\|Connection\|error"
echo.

echo Si NO ves "HTTP/1.1 200\|201\|404", el backend NO está respondiendo.
echo Si ves errores de conexión, verifica que el backend esté corriendo.
echo.
pause
