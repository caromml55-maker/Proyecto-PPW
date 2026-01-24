# Prueba del Login - Checklist Completo

## ✅ Paso 1: Verificar que el backend esté corriendo

Abre una terminal y ejecuta:
```bash
# En Eclipse/IDE: Run → Run Configurations
# O en terminal Maven:
mvn spring-boot:run
```

Deberías ver algo como:
```
Started Application in X seconds
Server is running on port 8080
```

## ✅ Paso 2: Verificar conectividad con el backend

Abre DevTools en el navegador (F12) → Console y ejecuta:

```javascript
fetch('http://localhost:8080/gproyectoFinal/api/user/test123')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.log('Error:', e.message))
```

**Resultados esperados:**
- ✅ Status 404 → Backend responde ✓
- ❌ CORS error → Backend necesita configuración CORS
- ❌ Error de conexión → Backend no está corriendo

## ✅ Paso 3: Ejecutar la aplicación Angular

```bash
npm start
# O manualmente:
ng serve -o
```

Debería abrir en `http://localhost:4200`

## ✅ Paso 4: Probar el login con Google

1. Abre DevTools (F12)
2. Pestaña **Console**
3. Click en botón "Iniciar sesión con Google"
4. Busca logs con formato `[Login]` y `[UserService]`

### Escenario A: Usuario NUEVO

**Logs esperados:**
```
[Login] Iniciando sesión con Google...
[Login] Usuario Google autenticado: abc123xyz
[UserService] Buscando usuario con UID: abc123xyz
[UserService] Usuario no encontrado (abc123xyz)
[UserService] Creando nuevo usuario: {uid: "abc123xyz", displayName: "Tu Nombre", ...}
[UserService] Usuario creado exitosamente: {uid: "abc123xyz", role: "user", ...}
[Login] Rol del usuario: user
[Login] Redirigiendo a /usuario
```

**Resultado esperado:** Redirección a `/usuario`

### Escenario B: Usuario EXISTENTE

**Logs esperados:**
```
[Login] Iniciando sesión con Google...
[Login] Usuario Google autenticado: abc123xyz
[UserService] Buscando usuario con UID: abc123xyz
[UserService] Usuario encontrado: {uid: "abc123xyz", role: "programador", ...}
[Login] Usuario encontrado en base de datos, actualizando datos...
[UserService] Actualizando usuario abc123xyz: {...}
[UserService] Usuario actualizado: {...}
[Login] Rol del usuario: programador
[Login] Redirigiendo a /programador
```

**Resultado esperado:** Redirección a `/programador` o `/admin` según el rol

## 🔴 Si NO funciona - Troubleshooting

### 1. El botón no responde
- ✅ Verifica que compiló sin errores: mira la terminal de Angular
- ✅ Abre Console (F12) → busca errores en rojo
- ✅ Recarga la página: Ctrl+Shift+R

### 2. "Firebase initialization failed"
- ✅ Verifica que `environment.ts` tiene la configuración de Firebase
- ✅ Verifica que tienes conexión a internet

### 3. Error "CORS error" o "Cannot access backend"
- ❌ El backend no tiene CORS configurado
- **Solución en Eclipse/Spring Boot:**
  ```java
  @Configuration
  public class CorsConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/api/**")
              .allowedOrigins("http://localhost:4200")
              .allowedMethods("GET", "POST", "PUT", "DELETE")
              .allowCredentials(true);
      }
  }
  ```

### 4. "Usuario no encontrado" pero no lo crea
- ❌ El endpoint POST `/api/user` no existe o tiene error
- **Verifica en Eclipse:**
  - El controller tenga `@PostMapping("/api/user")`
  - El servicio cree el usuario en BD
  - Retorna el usuario con `role`

### 5. Se crea el usuario pero no redirige
- ✅ Verifica que `dbUser.role` no sea null en el console.log
- ✅ Verifica que el rol es uno de: `'user'`, `'programador'`, `'admin'`
- ✅ Verifica que `/usuario`, `/programador` y `/admin` existen en app.routes.ts

### 6. Redirige pero la página está en blanco
- ✅ Probablemente es el `RoleGuard` bloqueando acceso
- **Verifica:** El usuario existe en Firestore con el rol correcto
- **Solución:** Asegúrate de que cuando creas el usuario en Eclipse, se guarde también en Firestore con la misma estructura

## 📋 Estructura esperada en BASE DE DATOS (Eclipse)

Tabla: `usuarios`

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| uid | VARCHAR(255) | `abc123xyz` |
| displayName | VARCHAR(255) | `Juan Pérez` |
| email | VARCHAR(255) | `juan@example.com` |
| photoURL | VARCHAR(500) | `https://...` |
| role | ENUM | `user`, `programador`, `admin` |
| createdAt | DATE | `2024-01-21` |

## 🔧 Pasos si NADA funciona

1. Reinicia el backend
2. Reinicia Angular: Ctrl+C en terminal y `ng serve` again
3. Limpia caché: Ctrl+Shift+Delete en navegador
4. Recarga: Ctrl+Shift+R
5. Revisa Console (F12) y busca TODOS los errores

## ✅ Verificación final

Cuando TODO funcione, verás:
- ✅ Google popup aparece
- ✅ Logs en console sin errores
- ✅ Redirección automática a `/usuario`, `/programador` o `/admin`
- ✅ Página carga correctamente (no en blanco)
