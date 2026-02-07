# Microservicio Pacientes

API REST para mantenimiento de pacientes, desplegada con AWS Lambda, API Gateway y DynamoDB.

Creado con GitHub Copilot el 7 de febrero de 2026.

## Funcionalidades
- Registrar paciente.
- Buscar paciente por DNI.
- Actualizar datos de paciente por DNI.
- Eliminar paciente solo si no tiene triajes registrados (valida contra el microservicio de triajes).

## Endpoints
- `POST /pacientes`
- `GET /pacientes/{dni}`
- `PUT /pacientes/{dni}`
- `DELETE /pacientes/{dni}`

## Despliegue automatico (API Gateway + Lambda + DynamoDB)
1. Asegura que el rol IAM `labrole` exista y tenga permisos para Lambda, API Gateway, DynamoDB y CloudFormation.
2. Instala Node.js (LTS) y Serverless Framework:
   - `npm install -g serverless`
3. Entra a la carpeta del microservicio:
   - `cd services/pacientes`
4. Despliega indicando la URL del microservicio de triajes:
   - `serverless deploy --param="triajesApiBase=https://<api-id>.execute-api.<region>.amazonaws.com"`
5. Copia la URL base del API desde la salida del despliegue.

## Variables de entorno
- `PATIENTS_TABLE`: se crea automaticamente con el despliegue.
- `TRIAJES_API_BASE`: URL base del microservicio de triajes para validar eliminacion.

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
