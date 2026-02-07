import json
import os
import urllib.parse
import urllib.request

import boto3
from botocore.exceptions import ClientError

TABLE_NAME = os.environ.get("PATIENTS_TABLE", "")
TRIAJES_API_BASE = os.environ.get("TRIAJES_API_BASE", "")

RESOURCE = boto3.resource("dynamodb")
TABLE = RESOURCE.Table(TABLE_NAME)

REQUIRED_FIELDS = {
    "dni",
    "nombres",
    "apellidos",
    "sexo",
    "fechaNacimiento",
    "correo",
    "celular",
    "direccion",
    "distrito",
    "provincia",
    "departamento",
}


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def parse_body(event):
    if not event.get("body"):
        return {}
    try:
        return json.loads(event["body"])
    except json.JSONDecodeError:
        return {}


def validate_payload(payload):
    missing = [field for field in REQUIRED_FIELDS if not payload.get(field)]
    if missing:
        return f"Faltan campos requeridos: {', '.join(missing)}"
    return ""


def create_patient(event, context):
    payload = parse_body(event)
    error = validate_payload(payload)
    if error:
        return response(400, {"message": error})

    dni = payload["dni"]
    existing = TABLE.get_item(Key={"dni": dni}).get("Item")
    if existing:
        return response(409, {"message": "Paciente ya registrado."})

    TABLE.put_item(Item=payload)
    return response(201, payload)


def get_patient(event, context):
    dni = event.get("pathParameters", {}).get("dni")
    if not dni:
        return response(400, {"message": "DNI requerido."})

    item = TABLE.get_item(Key={"dni": dni}).get("Item")
    if not item:
        return response(404, {"message": "Paciente no encontrado."})

    return response(200, item)


def update_patient(event, context):
    dni = event.get("pathParameters", {}).get("dni")
    if not dni:
        return response(400, {"message": "DNI requerido."})

    payload = parse_body(event)
    if not payload:
        return response(400, {"message": "Datos requeridos para actualizar."})

    if "dni" in payload:
        payload.pop("dni")

    if not payload:
        return response(400, {"message": "No hay campos para actualizar."})

    update_expression = "SET " + ", ".join(
        f"#{key} = :{key}" for key in payload.keys()
    )
    expression_names = {f"#{key}": key for key in payload.keys()}
    expression_values = {f":{key}": value for key, value in payload.items()}

    try:
        result = TABLE.update_item(
            Key={"dni": dni},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_names,
            ExpressionAttributeValues=expression_values,
            ConditionExpression="attribute_exists(dni)",
            ReturnValues="ALL_NEW",
        )
    except ClientError as error:
        if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return response(404, {"message": "Paciente no encontrado."})
        raise

    return response(200, result.get("Attributes", {}))


def delete_patient(event, context):
    dni = event.get("pathParameters", {}).get("dni")
    if not dni:
        return response(400, {"message": "DNI requerido."})

    if not TRIAJES_API_BASE:
        return response(
            500,
            {
                "message": "Configura TRIAJES_API_BASE para validar triajes antes de eliminar.",
            },
        )

    triage_url = f"{TRIAJES_API_BASE}/triajes?dni={urllib.parse.quote(dni)}"
    try:
        with urllib.request.urlopen(triage_url, timeout=5) as response_data:
            payload = json.loads(response_data.read().decode("utf-8"))
    except Exception:
        return response(502, {"message": "No se pudo validar triajes."})

    if payload.get("items"):
        return response(409, {"message": "Paciente tiene triajes registrados."})

    try:
        TABLE.delete_item(Key={"dni": dni}, ConditionExpression="attribute_exists(dni)")
    except ClientError as error:
        if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return response(404, {"message": "Paciente no encontrado."})
        raise

    return response(200, {"message": "Paciente eliminado."})
