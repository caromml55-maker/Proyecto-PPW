# Configuración Necesaria del Backend (Eclipse)

## Verificación del Endpoint de Usuario

Tu aplicación Angular está llamando a este endpoint:
```
GET    http://localhost:8080/gproyectoFinal/api/user/{uid}
POST   http://localhost:8080/gproyectoFinal/api/user
PUT    http://localhost:8080/gproyectoFinal/api/user/{uid}
```

### ✅ Checklist de Verificación Backend:

1. **Endpoint GET `/api/user/{uid}`**
   - Debe buscar un usuario por UID de Firebase
   - Retorna: `User` o 404 si no existe
   - Estructura esperada:
     ```json
     {
       "uid": "firebase_uid",
       "displayName": "Nombre Usuario",
       "email": "correo@example.com",
       "photoURL": "url_foto",
       "role": "user|programador|admin",
       "createdAt": "2024-01-20"
     }
     ```

2. **Endpoint POST `/api/user`**
   - Crea un nuevo usuario
   - Parámetros: Body JSON con estructura User
   - Retorna: Usuario creado con todos los campos

3. **Endpoint PUT `/api/user/{uid}`**
   - Actualiza datos del usuario (displayName, photoURL)
   - Parámetros parciales permitidos (merge)
   - Retorna: Usuario actualizado

4. **CORS Configuration**
   - Debe permitir requests desde: `http://localhost:4200`
   - Headers permitidos: `Content-Type`, `Authorization`
   - Métodos: GET, POST, PUT, DELETE

5. **Database**
   - La tabla de usuarios debe tener:
     - `uid` (Primary Key, String)
     - `displayName` (String)
     - `email` (String, Unique)
     - `photoURL` (String, nullable)
     - `role` (Enum: 'admin', 'programador', 'user')
     - `createdAt` (DateTime)

## Flujo de Autenticación Esperado

```
1. Usuario hace click en "Iniciar sesión con Google"
   ↓
2. Firebase popup abre y autentica con Google
   ↓
3. Se obtiene: uid, displayName, email, photoURL de Google
   ↓
4. Frontend llama GET /api/user/{uid}
   ├─ Si 404 → Crear usuario (POST) con role='user'
   └─ Si existe → Actualizar displayName y photoURL (PUT)
   ↓
5. Obtener rol del usuario
   ├─ role='admin' → Redirigir a /admin
   ├─ role='programador' → Redirigir a /programador
   └─ role='user' → Redirigir a /usuario
```

## Debugging

Si la redirección no funciona, abre la consola del navegador (F12) y busca logs con el prefijo `[Login]` y `[UserService]`.

**Problemas comunes:**

| Síntoma | Causa Probable | Solución |
|---------|---|---|
| "Cannot GET /api/user/{uid}" | Ruta no existe en backend | Verificar que el endpoint esté mapeado correctamente |
| CORS error | Backend no permite origen localhost:4200 | Agregar CORS headers en backend |
| Usuario redirigido pero no se carga la página | Guard rechazando acceso | Verificar que Firestore tenga el documento del usuario |
| Botón "Verificando..." nunca termina | Backend no responde | Verificar que el backend esté corriendo en puerto 8080 |

## Comando para iniciar el backend

Desde Eclipse/tu IDE Java:
```
Run → Run Configurations → Java Application
   Target: gproyectoFinal
   Port: 8080
```

O desde terminal si usas Maven:
```bash
mvn spring-boot:run
```

## Verificar que todo funciona

1. Abre: http://localhost:4200
2. Abre DevTools (F12)
3. Ve a la pestaña Console
4. Hace click en "Iniciar sesión con Google"
5. Debería ver logs como:
   ```
   [Login] Iniciando sesión con Google...
   [Login] Usuario Google autenticado: abc123xyz
   [UserService] Buscando usuario con UID: abc123xyz
   [UserService] Usuario no encontrado (abc123xyz)
   [UserService] Creando nuevo usuario: {...}
   [UserService] Usuario creado exitosamente: {...}
   [Login] Rol del usuario: user
   [Login] Redirigiendo a /usuario
   ```
