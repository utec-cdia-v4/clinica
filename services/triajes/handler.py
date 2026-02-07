import json
import os
import urllib.parse

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

TABLE_NAME = os.environ.get("TRIAJES_TABLE", "")
RESOURCE = boto3.resource("dynamodb")
TABLE = RESOURCE.Table(TABLE_NAME)

REQUIRED_FIELDS = {
    "dni",
    "fechaHora",
    "presionArterial",
    "frecuenciaCardiaca",
    "saturacionOxigeno",
    "temperaturaCorporal",
    "pesoKg",
    "tallaM",
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


def create_triaje(event, context):
    payload = parse_body(event)
    error = validate_payload(payload)
    if error:
        return response(400, {"message": error})

    TABLE.put_item(Item=payload)
    return response(201, payload)


def list_triajes(event, context):
    dni = event.get("queryStringParameters", {}) or {}
    dni_value = dni.get("dni")
    if not dni_value:
        return response(400, {"message": "DNI requerido."})

    result = TABLE.query(KeyConditionExpression=Key("dni").eq(dni_value))
    items = [
        {"dni": item.get("dni"), "fechaHora": item.get("fechaHora")}
        for item in result.get("Items", [])
    ]
    return response(200, {"items": items})


def get_triaje(event, context):
    params = event.get("pathParameters", {})
    dni = params.get("dni")
    fecha = params.get("fechaHora")
    if not dni or not fecha:
        return response(400, {"message": "DNI y fechaHora requeridos."})

    decoded_fecha = urllib.parse.unquote(fecha)

    try:
        result = TABLE.get_item(Key={"dni": dni, "fechaHora": decoded_fecha})
    except ClientError:
        return response(500, {"message": "Error al consultar triaje."})

    item = result.get("Item")
    if not item:
        return response(404, {"message": "Triaje no encontrado."})

    return response(200, item)
