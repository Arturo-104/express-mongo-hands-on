# 📘 Guía Didáctica: Migración de PostgreSQL a MySQL en Node.js (Express)

Esta guía explica de forma clara, práctica y didáctica cómo adaptar una aplicación web construida con **Node.js, Express y PostgreSQL** (`awcodePostgres.js`) para utilizar **MySQL** en local (`awcodeMySQL.js`), manteniendo intactas la lógica de negocio y las vistas EJS.

---

## 🎯 1. Introducción y Contexto

Tanto **PostgreSQL** como **MySQL** son sistemas de gestión de bases de datos relacionales (**RDBMS**). Ambos comparten los mismos principios fundamentales:
- Emplean el lenguaje estándar **SQL**.
- Modelan la información en **tablas** organizadas por filas y columnas.
- Implementan integridad referencial mediante **claves primarias (`PRIMARY KEY`)** y **claves foráneas (`FOREIGN KEY`)**.
- Garantizan transacciones seguras bajo el estándar **ACID**.

Dado que ambos motores son relacionales, **la estructura de datos y las consultas no cambian drásticamente**. La adaptación se centra casi en su totalidad en el **driver cliente de Node.js** y en particularidades de dialecto SQL.

---

## 💡 2. Concepto Clave: Arranque y Credenciales en macOS

Un error muy frecuente al empezar a trabajar con servidores locales es confundir la autenticación del sistema operativo con la de la base de datos:

```mermaid
flowchart LR
    A["Comando con sudo"] -->|"Pide contraseña de macOS"| B["Usuario Administrador del Mac"]
    C["Cliente MySQL (mysql -u root -p)"] -->|"Pide contraseña de la BD"| D["Usuario root de MySQL (ej. Pepito123)"]
```

### La confusión habitual con `sudo`
Al ejecutar:
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```
1. `Password:` 👉 **Es la contraseña de tu usuario de macOS** (la que usas para desbloquear el ordenador). *Por seguridad, la terminal no muestra asteriscos al teclear.*
2. Si pones la contraseña de MySQL aquí, macOS responderá con `Sorry, try again`.

### Conectarse a MySQL
La contraseña de MySQL (`Pepito123`) se introduce únicamente al conectarse al cliente:
```bash
/usr/local/mysql/bin/mysql -u root -p
```
Aquí verás `Enter password:`, donde sí introduces la contraseña del usuario `root` de MySQL.

### Comandos de control del servicio en macOS
| Acción | Comando |
| :--- | :--- |
| **Iniciar servidor** | `sudo /usr/local/mysql/support-files/mysql.server start` |
| **Ver estado** | `sudo /usr/local/mysql/support-files/mysql.server status` |
| **Detener servidor** | `sudo /usr/local/mysql/support-files/mysql.server stop` |
| **Reiniciar servidor** | `sudo /usr/local/mysql/support-files/mysql.server restart` |

---

## 📊 3. Tabla Comparativa: PostgreSQL vs MySQL en Node.js

| Concepto | PostgreSQL (`pg`) | MySQL (`mysql2/promise`) |
| :--- | :--- | :--- |
| **Driver NPM** | `pg` (`const { Pool } = require("pg")`) | `mysql2` (`const mysql = require("mysql2/promise")`) |
| **Creación del Pool** | `new Pool({ connectionString })` | `mysql.createPool({ host, user, password, database, port })` |
| **Marcadores de parámetros** | `$1, $2, $3...` (posicionales numerados) | `?, ?, ?...` (posicionales secuenciales) |
| **Resultado de consultas** | `result.rows` | `const [rows] = await pool.query(...)` (desestructuración de tupla) |
| **Autoincrementables** | `id SERIAL PRIMARY KEY` | `id INT AUTO_INCREMENT PRIMARY KEY` |
| **Obtener ID generado** | `INSERT ... RETURNING id` $\rightarrow$ `res.rows[0].id` | `INSERT ...` $\rightarrow$ `insertResult.insertId` |
| **Crear Base de Datos** | Comandos administrativos fuera de la conexión | `CREATE DATABASE IF NOT EXISTS \`db_name\`;` |

---

## 🔍 4. Análisis Detallado de los Cambios de Código

A continuación se comparan los fragmentos de código entre `awcodePostgres.js` y `awcodeMySQL.js`.

### 1. Librería y Pool de Conexiones

#### En PostgreSQL (`awcodePostgres.js`):
```javascript
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgres://postgres:Pepito123@localhost:5432/todolistDB"
});
```

#### En MySQL (`awcodeMySQL.js`):
```javascript
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Pepito123",
    database: "todolistDB",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});
```
> **Nota didáctica**: Usamos `mysql2/promise` para trabajar de forma nativa con `async/await`, exactamente igual que con `pg`.

---

### 2. Creación de Tablas (DDL) y Base de Datos

#### En PostgreSQL:
```sql
CREATE TABLE IF NOT EXISTS lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE
);
```

#### En MySQL:
```sql
CREATE TABLE IF NOT EXISTS lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    list_id INT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);
```
> **Diferencias clave**:
> - En PostgreSQL el tipo `SERIAL` crea automáticamente una secuencia (`SEQUENCE`) y la asigna a la columna.
> - En MySQL se declara explícitamente `INT AUTO_INCREMENT PRIMARY KEY`.
> - La clave foránea en MySQL se define habitualmente con la cláusula separada `FOREIGN KEY (columna) REFERENCES tabla(id)`.

---

### 3. Marcadores de Parámetros y Prevención de Inyección SQL

Ambos motores soportan **consultas parametrizadas (Prepared Statements)** para evitar vulnerabilidades de **SQL Injection**, pero difieren en la sintaxis de los placeholders:

#### En PostgreSQL:
```javascript
// Usa índices $1, $2, etc.
await pool.query(
    "INSERT INTO items (name, list_id) VALUES ($1, $2)",
    [itemName, listId]
);
```

#### En MySQL:
```javascript
// Usa signos de interrogación ?
await pool.query(
    "INSERT INTO items (name, list_id) VALUES (?, ?)",
    [itemName, listId]
);
```

---

### 4. Obtención del ID del nuevo registro insertado

Cuando creamos una lista nueva, necesitamos su `id` para poder asociarle tareas hijas.

#### En PostgreSQL:
PostgreSQL cuenta con la potente cláusula `RETURNING`:
```javascript
const insertResult = await pool.query(
    "INSERT INTO lists (name) VALUES ($1) RETURNING id",
    ["Today"]
);
const listId = insertResult.rows[0].id;
```

#### En MySQL:
El motor de MySQL devuelve metadatos de la operación donde viene el atributo `insertId`:
```javascript
const [insertResult] = await pool.query(
    "INSERT INTO lists (name) VALUES (?)",
    ["Today"]
);
const listId = insertResult.insertId;
```

---

### 5. Compatibilidad Transparente con las Vistas EJS (`_id` vs `id`)

En MongoDB, el identificador único es `_id`. Las plantillas EJS (`views/list.ejs`) venían programadas para leer `<%= item._id %>`.

Para evitar modificar las plantillas HTML/EJS al migrar a SQL, en ambos motores utilizamos un **alias SQL**:

```sql
SELECT id AS _id, name FROM items WHERE list_id = ? ORDER BY id ASC;
```

De este modo:
- La base de datos sigue utilizando su columna canónica `id`.
- El objeto JavaScript devuelto tiene la propiedad `_id`.
- La vista `views/list.ejs` funciona idénticamente tanto con MongoDB, PostgreSQL como MySQL.

---

## 🚀 5. Puesta en Marcha

### 1. Instalar la dependencia
Si no está instalada, añade `mysql2`:
```bash
npm install mysql2
```

### 2. Verificar que MySQL está en ejecución
```bash
sudo /usr/local/mysql/support-files/mysql.server status
```
Debe indicar: `SUCCESS! MySQL running (...)`.

### 3. Arrancar la aplicación
Hemos configurado un script directo en el archivo `package.json`:
```bash
npm run start:mysql
```
O directamente con Node:
```bash
node awcodeMySQL.js
```

### 4. Salida esperada por consola
```text
✅ Base de datos y tablas de MySQL comprobadas/creadas correctamente (lists e items).
🚀 Servidor iniciado con MySQL en el puerto 3000
```

---

## 🧪 6. Ejercicio Didáctico Avanzado: El poder de los JOINs (`INNER JOIN` vs `LEFT JOIN`)

En el archivo [`awcodeMySQLJoin.js`](file:///Users/fjbanezares/express-mongo-hands-on/awcodeMySQLJoin.js) ampliamos la base de datos a un modelo de **3 tablas relacionadas**:

```mermaid
erDiagram
    lists_join ||--o{ items_join : "1 lista tiene muchas tareas (OBLIGATORIO)"
    priorities_join ||--o{ items_join : "1 prioridad clasifica muchas tareas (OPCIONAL)"

    lists_join {
        int id PK
        varchar name UK
    }

    priorities_join {
        int id PK
        varchar name UK
        varchar badge_color
        varchar icon
    }

    items_join {
        int id PK
        varchar name
        int list_id FK "NOT NULL"
        int priority_id FK "NULLable"
    }
```

### ¿Por qué forzar `INNER JOIN` y `LEFT JOIN` en la misma consulta?

Observa la consulta principal que renderiza la lista:

```sql
SELECT 
    items_join.id AS _id,
    items_join.name AS name,
    lists_join.name AS list_name,
    priorities_join.name AS priority_name,
    priorities_join.badge_color AS priority_color
FROM items_join
INNER JOIN lists_join ON items_join.list_id = lists_join.id
LEFT JOIN priorities_join ON items_join.priority_id = priorities_join.id
WHERE lists_join.name = 'Today'
ORDER BY items_join.id ASC;
```

1. **`INNER JOIN lists_join`**:
   - Cada tarea **pertenece obligatoriamente a una lista** (`list_id NOT NULL`).
   - Solo queremos mostrar tareas que correspondan a una lista válida existente.

2. **`LEFT JOIN priorities_join`**:
   - La urgencia es **opcional**: el usuario puede crear una tarea *"Sin urgencia"*, dejando `priority_id = NULL`.
   - **El peligro del INNER JOIN**: Si usáramos `INNER JOIN priorities_join`, **¡todas las tareas sin urgencia desaparecerían de la pantalla!**
   - **El poder del LEFT JOIN**: Conserva todas las filas de la tabla izquierda (`items_join`), rellenando con `NULL` los datos de la prioridad cuando la tarea no tenga urgencia asignada.

### Laboratorio en vivo: `/comparativa-joins`
Al arrancar este ejercicio con:
```bash
npm run start:mysql:join
```
Puedes visitar en tu navegador:
👉 `http://localhost:3000/comparativa-joins`
para ver en dos columnas lado a lado la diferencia exacta de registros que devuelve un `INNER JOIN` frente a un `LEFT JOIN`.

---

## 📝 7. Conclusión Didáctica

1. **La arquitectura se mantiene**: Las capas de enrutamiento (Express) y presentación (EJS) permanecen 100% reutilizables.
2. **Abstracción del almacenamiento**: Solo cambia el conector y los pequeños modismos del dialecto SQL (placeholders `$1` vs `?`, `SERIAL` vs `AUTO_INCREMENT`, y `RETURNING` vs `insertId`).
3. **Escalabilidad y Modelado**: Los `JOIN` relacionales permiten enriquecer la aplicación (por ejemplo, con catálogos de prioridades) de manera limpia y normalizada sin duplicar información.


