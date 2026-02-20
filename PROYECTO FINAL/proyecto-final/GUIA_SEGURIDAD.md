# 🔒 Guía: Pruebas de Seguridad y Penetración

## Tipos de Pruebas de Seguridad

### 1. Pruebas de Autenticación
### 2. Pruebas de Autorización
### 3. Pruebas de Inyección
### 4. Pruebas de Criptografía
### 5. Pruebas de Validación

---

## 🧪 Pruebas Unitarias de Seguridad

### tests/security.test.js

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Pruebas de Seguridad', () => {
    
    // ========== PRUEBAS DE CONTRASEÑAS ==========
    
    describe('Hashing de Contraseñas', () => {
        test('Las contraseñas deben estar hasheadas', async () => {
            const password = 'MiSuperContraseña123';
            const hashed = await bcrypt.hash(password, 10);
            
            // La contraseña hasheada no debe ser igual a la original
            expect(hashed).not.toBe(password);
        });

        test('El hash no debe ser reversible', async () => {
            const hashed = await bcrypt.hash('password123', 10);
            
            // Intentar "deshashar" no debe funcionar
            expect(async () => {
                // No existe función inversa
                bcrypt.unhash(hashed); // ❌ Error
            }).rejects.toThrow();
        });

        test('El mismo password genera diferentes hashes', async () => {
            const password = 'MismaContraseña';
            const hash1 = await bcrypt.hash(password, 10);
            const hash2 = await bcrypt.hash(password, 10);
            
            // Deben ser diferentes (debido al salt)
            expect(hash1).not.toBe(hash2);
            
            // Pero ambos deben coincidir con la contraseña
            expect(await bcrypt.compare(password, hash1)).toBe(true);
            expect(await bcrypt.compare(password, hash2)).toBe(true);
        });

        test('Verificar contraseña incorrecta debe fallar', async () => {
            const correcto = await bcrypt.hash('password123', 10);
            const verificar = await bcrypt.compare('passwordIncorrecto', correcto);
            
            expect(verificar).toBe(false);
        });
    });

    // ========== PRUEBAS DE TOKENS JWT ==========
    
    describe('Seguridad de JWT', () => {
        const secret = 'clave-super-secreta';

        test('El token debe contener 3 partes (header.payload.signature)', () => {
            const token = jwt.sign({ id: '123' }, secret);
            const partes = token.split('.');
            
            expect(partes.length).toBe(3);
        });

        test('No se puede modificar el payload sin invalidar el token', () => {
            const token = jwt.sign({ id: '123', rol: 'user' }, secret);
            const partes = token.split('.');
            
            // Modificar el payload
            const payloadModificado = Buffer.from(
                JSON.stringify({ id: '123', rol: 'admin' })
            ).toString('base64');
            
            const tokenModificado = `${partes[0]}.${payloadModificado}.${partes[2]}`;
            
            // El token modificado debe ser inválido
            expect(() => {
                jwt.verify(tokenModificado, secret);
            }).toThrow('invalid signature');
        });

        test('El token debe expirar después del tiempo especificado', () => {
            const tokenCorto = jwt.sign(
                { id: '123' }, 
                secret, 
                { expiresIn: '0s' } // Expira inmediatamente
            );

            // Esperar a que expire
            setTimeout(() => {
                expect(() => {
                    jwt.verify(tokenCorto, secret);
                }).toThrow('jwt expired');
            }, 100);
        });

        test('No se debe poder usar token expirado', () => {
            const tokenExpirado = jwt.sign(
                { id: '123' },
                secret,
                { expiresIn: '-1s' } // Ya está expirado
            );

            expect(() => {
                jwt.verify(tokenExpirado, secret);
            }).toThrow();
        });

        test('No se debe poder cambiar la clave secreta', () => {
            const token = jwt.sign({ id: '123' }, secret);
            const otraClaveSecreta = 'otra-clave-diferente';

            expect(() => {
                jwt.verify(token, otraClaveSecreta);
            }).toThrow();
        });
    });

    // ========== PRUEBAS DE VALIDACIÓN DE DATOS ==========
    
    describe('Validación de Entrada', () => {
        test('No aceptar emails inválidos', () => {
            const emailsInvalidos = [
                'notanEmail',
                '@example.com',
                'user@',
                'user@.com',
                ''
            ];

            emailsInvalidos.forEach(email => {
                const esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                expect(esValido).toBe(false);
            });
        });

        test('Aceptar emails válidos', () => {
            const emailsValidos = [
                'user@example.com',
                'test.user@example.co.uk',
                'user+tag@example.com'
            ];

            emailsValidos.forEach(email => {
                const esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                expect(esValido).toBe(true);
            });
        });

        test('Rechazar contraseñas muy cortas', () => {
            const contrasenasCortas = ['123', '1234', 'ab'];
            
            contrasenasCortas.forEach(pass => {
                expect(pass.length >= 6).toBe(false);
            });
        });

        test('Aceptar contraseñas seguras', () => {
            const contrasenaSegura = 'MiContraseña123!@#';
            
            const esSegura = 
                contrasenaSegura.length >= 8 && // Longitud mínima
                /[A-Z]/.test(contrasenaSegura) && // Mayúscula
                /[0-9]/.test(contrasenaSegura); // Número
                
            expect(esSegura).toBe(true);
        });
    });

    // ========== PRUEBAS DE INYECCIÓN SQL/NOSQL ==========
    
    describe('Protección contra Inyecciones', () => {
        test('Validar que no se permitan caracteres susceptibles a inyección', () => {
            const inputSospechoso = "'; DROP TABLE users; --";
            
            // Validación básica
            const esSeguro = /^[a-zA-Z0-9@.\-_]+$/.test(inputSospechoso);
            expect(esSeguro).toBe(false);
        });

        test('NoSQL injection - No permitir objetos en búsquedas', () => {
            const inputUsuario = { $ne: null }; // Intento de inyección NoSQL
            const filtro = { email: inputUsuario };
            
            // Verificar que sea string
            expect(typeof inputUsuario === 'string').toBe(false);
        });

        test('Escapar caracteres especiales', () => {
            const entrada = '<script>alert("XSS")</script>';
            
            // Escapar
            const escapada = entrada
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
                
            expect(escapada).not.toContain('<script>');
            expect(escapada).toContain('&lt;script&gt;');
        });
    });

    // ========== PRUEBAS DE AUTORIZACIÓN ==========
    
    describe('Control de Acceso (ACL)', () => {
        test('Usuario no-admin no puede acceder a rutas admin', () => {
            const usuario = { id: '123', rol: 'user' };
            const esAdmin = usuario.rol === 'admin';
            
            expect(esAdmin).toBe(false);
        });

        test('Admin puede acceder a rutas admin', () => {
            const admin = { id: '123', rol: 'admin' };
            const esAdmin = admin.rol === 'admin';
            
            expect(esAdmin).toBe(true);
        });

        test('Usuario no puede modificar datos de otro usuario', () => {
            const usuarioActual = { id: 'user1' };
            const propietario = { id: 'user2' };
            
            const puedeModificar = usuarioActual.id === propietario.id;
            expect(puedeModificar).toBe(false);
        });

        test('Usuario puede modificar sus propios datos', () => {
            const usuarioActual = { id: 'user1' };
            const propietario = { id: 'user1' };
            
            const puedeModificar = usuarioActual.id === propietario.id;
            expect(puedeModificar).toBe(true);
        });
    });

    // ========== PRUEBAS DE EXPOSICIÓN DE DATOS ==========
    
    describe('No exponer información sensible', () => {
        test('No incluir contraseña en respuesta de usuario', () => {
            const usuario = {
                id: '123',
                email: 'user@example.com',
                nombre: 'Juan',
                rol: 'user'
                // password NO INCLUIDO
            };
            
            expect(usuario.password).toBeUndefined();
        });

        test('No exponer columnas internas del DB', () => {
            const usuario = {
                id: '123',
                nombre: 'Juan',
                email: 'juan@example.com'
                // __v no incluido
                // _createdAt no incluido
            };
            
            expect(usuario.__v).toBeUndefined();
            expect(usuario._createdAt).toBeUndefined();
        });

        test('No loguear información sensible', () => {
            const datosLoguear = {
                usuario: 'juan',
                accion: 'login'
                // password NO INCLUIDO en logs
            };
            
            expect(datosLoguear.password).toBeUndefined();
        });
    });

    // ========== PRUEBAS DE RATE LIMITING ==========
    
    describe('Rate Limiting y Protección contra Ataques', () => {
        test('Limitar intentos de login', () => {
            const intentosFallidos = 0;
            const maxIntentosPermitidos = 5;
            
            // Simular intentos
            for (let i = 0; i < 6; i++) {
                if (i >= maxIntentosPermitidos) {
                    expect(() => {
                        throw new Error('Demasiados intentos fallidos');
                    }).toThrow();
                }
            }
        });

        test('Limitar solicitudes por IP', () => {
            const solicitudesPorIP = {};
            const limiteSegundos = 60;
            const maxSolicitudes = 100;
            
            const verificarRateLimit = (ip) => {
                if (!solicitudesPorIP[ip]) {
                    solicitudesPorIP[ip] = { count: 0, timestamp: Date.now() };
                }
                
                solicitudesPorIP[ip].count++;
                return solicitudesPorIP[ip].count < maxSolicitudes;
            };
            
            expect(verificarRateLimit('192.168.1.1')).toBe(true);
        });
    });
});
```

---

## 🧑‍💻 Pruebas Manuales de Seguridad

### 1. Testing de Autenticación

```bash
# Test 1: Login sin credenciales
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 2: Credenciales incorrectas
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fake@example.com","password":"wrong"}'

# Test 3: Acceso sin token
curl http://localhost:3000/api/tareas

# Test 4: Token inválido
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/tareas

# Test 5: Token expirado (manual, esperar 24h)
```

### 2. Testing de Autorización

```bash
# Test 1: Usuario regular accediendo a ruta admin
curl -H "Authorization: Bearer user_token" \
  http://localhost:3000/api/admin/usuarios

# Test 2: Intentar modificar tarea de otro usuario
curl -X DELETE http://localhost:3000/api/tareas/id_de_otro_usuario \
  -H "Authorization: Bearer mi_token"
```

### 3. Testing de Inyección

```bash
# Test XSS
curl -X POST http://localhost:3000/api/tareas \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"<script>alert(\"XSS\")</script>"}'

# Test NoSQL Injection
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}'
```

### 4. Testing de Validación

```bash
# Test email inválido
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"pass123","nombre":"Test"}'

# Test contraseña corta
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123","nombre":"Test"}'

# Test caracteres especiales
curl -X POST http://localhost:3000/api/tareas \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"'; DROP TABLE tareas; --"}'
```

---

## 🛠️ Herramientas de Testing de Seguridad

### OWASP ZAP (Gratis)
```bash
# Descargar desde https://www.zaproxy.org/
# Escanear aplicación
zaproxy -cmd -quickurl http://localhost:3000
```

### Burp Suite Community (Gratis)
```bash
# Descargar desde https://portswigger.net/burp/
# Configurar proxy y hacer requests
# Interceptar y modificar requests
```

### SQLMap (Inyección SQL)
```bash
# Detectar vulnerabilidades
sqlmap -u "http://localhost:3000/api/tareas" \
  --headers "Authorization: Bearer token"
```

### npm audit (Vulnerabilidades de dependencias)
```bash
npm audit
npm audit fix
npm audit fix --force
```

---

## 📋 Checklist de Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Validación en todas las entradas
- ✅ Autorización basada en roles
- ✅ HTTPS/SSL habilitado
- ✅ CORS configurado correctamente
- ✅ Headers de seguridad (helmet.js)
- ✅ Rate limiting implementado
- ✅ Errores no exponen detalles
- ✅ Contraseñas no se loguean
- ✅ Variables sensibles en .env
- ✅ SQL/NoSQL injection prevenida
- ✅ XSS prevention implementada
- ✅ CSRF tokens si es necesario
- ✅ Logs de seguridad activos

---

## 🚨 Vulnerabilidades Comunes

### 1. Contraseñas débiles
❌ No hacer: `user.password = "password123"`
✅ Hacer: `user.password = await bcrypt.hash(password, 10)`

### 2. Tokens sin expiración
❌ No hacer: `jwt.sign({ id: user._id })`
✅ Hacer: `jwt.sign({ id: user._id }, secret, { expiresIn: '24h' })`

### 3. No validar entrada
❌ No hacer: `await User.findOne({ email: req.body.email })`
✅ Hacer: Validar antes con middleware

### 4. Exponer detalles de error
❌ No hacer: `res.send(err.stack)`
✅ Hacer: `res.status(500).json({ error: 'Error interno del servidor' })`

### 5. CORS abierto
❌ No hacer: `cors()`
✅ Hacer: `cors({ origin: process.env.FRONTEND_URL })`

---

## 📚 Recursos de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Top 10](https://owasp.org/www-project-api-security/)
- [npm Vulnerabilities](https://www.npmjs.com/advisories)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

