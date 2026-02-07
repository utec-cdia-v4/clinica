# Clinica Triaje - Frontend

Web responsiva para el registro de pacientes y triajes. Construida con HTML, CSS y JavaScript sin frameworks.

Creado con GitHub Copilot el 7 de febrero de 2026.

## Funcionalidades
- Mantenimiento de pacientes con formulario en pasos para movil.
- Registro de triaje con busqueda de paciente por DNI.
- Consulta y detalle de triajes por DNI.
- Configuracion de URLs de API desde la interfaz (almacenado en localStorage).

## Estructura
- `public/index.html` interfaz principal.
- `public/styles.css` estilos.
- `public/app.js` logica del frontend.
- `serverless.yml` despliegue a S3.

## Despliegue automatico (S3 + Serverless)
1. Asegura que el rol IAM `labrole` exista y tenga permisos para S3 y CloudFormation.
2. Instala Node.js (LTS) y Serverless Framework:
   - `npm install -g serverless`
3. Entra a la carpeta del frontend:
   - `cd frontend`
4. Inicializa dependencias e instala el plugin de sincronizacion:
   - `npm init -y`
   - `npm install --save-dev serverless-s3-sync`
5. Despliega:
   - `serverless deploy`
6. Abre la URL de Website del bucket S3 desde la salida del despliegue.
7. En la interfaz web, configura las URLs de API de Pacientes y Triajes.

## Prompt utilizado
Rol/Persona:
Actúa como un programador Full Stack.

Contexto:
Una clínica necesita una web para registrar el triaje de sus pacientes.

Tarea/Objetivo:
Crea una web responsiva con estas funcionalidades:
- Mantenimiento de Pacientes: Permite registrar los datos de un nuevo paciente (DNI, Nombres, Apellidos, Sexo (Masculino, Femenino), Fecha Nacimiento, Correo electrónico, Celular, Dirección, Distrito, Provincia, Departamento), modificar los datos de un paciente por su DNI, eliminar un paciente por su DNI validando que no tenga triajes registrados, buscar un paciente por su DNI y ver todos sus datos.
- Registro de Triaje: Se busca un paciente por su DNI, se muestra sus nombres y apellidos y se registra el triaje (Fecha y hora, Presión arterial, Frecuencia cardiaca, Saturación de óxigeno, Temperatura corporal, Peso en kilogramos y Talla en metros).
- Consulta de Triajes: Buscar triajes de un DNI, se muestra un listado de triajes encontrados (DNI, Fecha y hora) y poder ver el detalle de un triaje seleccionado.

Requisitos de la respuesta:
- Para la web responsiva (FrontEnd) utiliza sólo HTML + CSS + JavaScript. Utiliza el servicio S3 de AWS para alojar la web. Automatiza la creación de un bucket S3 público y el despliegue de la web con el framework serverless considerando el uso del rol de IAM labrole existente.
- Para el BackEnd crea 2 microservicios o apis rest (pacientes y triajes). Utiliza estos servicios de AWS (Api Gateway, Lambda y DynamoDB) para cada microservicio. Utiliza lenguaje de programación python. Automatiza el despliegue de cada microservicio con el framework serverless considerando el uso del rol de IAM labrole existente.
- Genera un readme.md para la web y para cada microservicio con las funcionalidades que contiene y todas las instrucciones para hacer el despliegue automático. Adicionalmente indica explícitamente que ha sido creado con GitHub Copilot y la fecha de creación e incluye como referencia todo el texto del prompt utilizado.
 
Elementos adicionales:
- Si es mucha información en pantalla de celular para el registro de un nuevo paciente, considera partirlo en pasos.
