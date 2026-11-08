# 📚 Materiales Didácticos: Arquitectura, Despliegues y Bases de Datos
> **Hub central de módulos formativos teóricos y prácticos: de MongoDB y PostgreSQL a DevOps, Docker, Kubernetes, DevSecOps y Arquitectura de Sistemas.**

---

📍 **Navegación:** [🏠 Volver a la Raíz del Proyecto](../README.md)

---

## 🗺️ Mapa Completo de los 8 Módulos

```
   ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────────┐
   ▼                   ▼                   ▼                   ▼                   ▼                   ▼                   ▼                   ▼                   ▼
[ MÓDULO 1 ]        [ MÓDULO 2 ]        [ MÓDULO 3 ]        [ MÓDULO 4 ]        [ MÓDULO 5 ]        [ MÓDULO 6 ]        [ MÓDULO 7 ]        [ MÓDULO 8 ]
Persistencia vs RAM awcodeAtlas.js      Despliegues Cloud   Balanceadores, DNS  Postgres vs Mongo   Despliegue Seguro   PostgreSQL Arq.     MySQL & Vida Tarea
MongoDB vs SQL      CRUD y Mongoose     Docker, K8s, CI/CD  Namespaces & Redes  awcodePostgres.js   DevSecOps & OWASP   Esquemas, Pass      12 Infografías
```

### 🧭 Índice de Módulos Formativos

1. 📘 **[Módulo 1: Fundamentos de Persistencia y Comparativa NoSQL vs SQL](./01-fundamentos-persistencia-mongo-vs-sql.md)**  
   *Por qué importa persistir, RAM vs disco, MongoDB vs PostgreSQL, y criterio de selección de tecnologías.*

2. 📗 **[Módulo 2: Curso Práctico - Código awcodeAtlas.js y CRUD Completo](./02-curso-practica-awcodeAtlas-crud-completo.md)**  
   *Anatomía de Express, EJS, subdocumentos embebidos en Mongoose, patrón PRG y conexión segura a MongoDB Atlas.*

3. 📙 **[Módulo 3: Curso Maestro de Despliegues Cloud, Contenedores y DevOps](./03-curso-maestro-despliegues-cloud-devops.md)**  
   *Render, Dockerfiles en Alpine Linux, orquestación con Kubernetes, Hyperscalers (AWS/GCP/Azure) y pipelines de CI/CD.*

4. 📕 **[Módulo 4: Balanceadores de Carga, DNS, Redes y Seguridad en Despliegues](./04-balanceadores-dns-redes-y-seguridad.md)**  
   *Balanceo L4 vs L7, estrategias Zero-Downtime (Rolling, Blue-Green, Canary), Ingress/Routes, resolución DNS y namespaces.*

5. 📓 **[Módulo 5: Despliegue con PostgreSQL vs MongoDB Atlas (awcodePostgres.js)](./05-despliegue-postgresql-vs-mongodb.md)**  
   *Backend relacional, `CREATE TABLE IF NOT EXISTS`, pools de conexión SSL, relaciones 1:N con `CASCADE` y matriz comparativa.*

6. 🛡️ **[Módulo 6: Despliegue Seguro, DevSecOps y Hardening Web](./06-despliegue-seguro-devsecops-owasp.md)**  
   *Inyecciones SQL/NoSQL en código real, TLS con Wireshark, hardening con Helmet, contenedores no-root y seguridad en K8s.*

7. 🐘 **[Módulo 7: PostgreSQL: Arquitectura, Esquemas, Passwords e Inicialización](./07-postgresql-arquitectura-esquemas-passwords.md)**  
   *La metáfora del edificio residencial (Instancia ➔ Base de datos ➔ Esquema ➔ Tablas), ANSI SQL-92 vs namespaces, cambio de llaves, `search_path` y automatización con Python.*

8. 🐬 **[Módulo 8: «La Vida de una Tarea» — Node.js, Express y MySQL (12 Infografías)](./08-curso-maestro-todolist-mysql-infografia.md)**  
   *Deconstrucción profunda de las 12 láminas infográficas: motor V8, npm, arquitectura 3 capas, pools DDL, mapeo SQL a objetos JS, SSR con EJS, prevención de inyecciones SQL, ciclo de vida del Event Loop y concurrencia con `async/await`.*

---

## 🛠️ Guías Prácticas y de Resolución Técnica (MySQL)

En la carpeta [`mysql_guias_apoyo/`](./mysql_guias_apoyo/) se encuentran guías de laboratorio adicionales:
- 📄 **[`01_migracion_postgres_a_mysql.md`](./mysql_guias_apoyo/01_migracion_postgres_a_mysql.md):** Comparativa directa de drivers (`pg` vs `mysql2`), marcadores de parámetros (`$1` vs `?`) y obtención de IDs (`RETURNING` vs `insertId`).
- 📄 **[`02_ejercicio_avanzado_joins.md`](./mysql_guias_apoyo/02_ejercicio_avanzado_joins.md):** Laboratorio con 3 tablas (`lists_join`, `priorities_join`, `items_join`), demostración de `INNER JOIN` vs `LEFT JOIN`, y retos avanzados (N:M con tags, `RIGHT JOIN` y `COUNT(*)`) para alumnos.
- 📄 **[`03_reinicio_node_y_enrutamiento_express.md`](./mysql_guias_apoyo/03_reinicio_node_y_enrutamiento_express.md):** Ciclo de vida de Node, liberación de puertos (`kill -9` ante `EADDRINUSE`) y la regla del embudo en Express.
- 📄 **[`04_resolucion_paso_a_paso_bugs.md`](./mysql_guias_apoyo/04_resolucion_paso_a_paso_bugs.md):** Explicación didáctica con analogías de por qué `CREATE TABLE IF NOT EXISTS` no añade columnas y por qué las peticiones se quedan colgadas si una ruta dinámica no llama a `res.send()`.

---

## 🖼️ Las 4 Colecciones de Infografías (48 Láminas en Total)

* 🐬 **[`infografia_app_todolist_mysql/`](./infografia_app_todolist_mysql/):** 12 infografías de la arquitectura completa Node.js + Express + MySQL (*La vida de una tarea*).
* 📂 **[`inforgrafia_despliegue_atlas/`](./inforgrafia_despliegue_atlas/):** 21 infografías de persistencia, CRUD con Mongoose, Docker, K8s, hyperscalers, balanceadores y DNS.
* 🛡️ **[`seguridad_despliegues/`](./seguridad_despliegues/):** 9 infografías de ciberseguridad, OWASP, TLS, hardening y DevSecOps.
* 🐘 **[`postgres_schemas_passwords_init/`](./postgres_schemas_passwords_init/):** 6 infografías de arquitectura PostgreSQL, esquemas, `search_path`, roles y automatización Python.
