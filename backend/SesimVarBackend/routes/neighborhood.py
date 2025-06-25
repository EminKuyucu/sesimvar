from flask import Blueprint, jsonify
from db import get_db_connection

neighborhood_bp = Blueprint("neighborhood", __name__, url_prefix="/neighborhoods")


@neighborhood_bp.route("", methods=["GET"])
def list_neighborhoods():
    """
    List all neighborhoods
    ---
    tags:
      - Neighborhood
    responses:
      200:
        description: List of all neighborhoods
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1
              name:
                type: string
                example: "Rizaiye"
              district:
                type: string
                example: "Merkez"
              city:
                type: string
                example: "Elazig"
              latitude:
                type: number
                example: 38.6766
              longitude:
                type: number
                example: 39.2238
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM neighborhoods")
        neighborhoods = cursor.fetchall()
        return jsonify(neighborhoods), 200

    except Exception as e:
        print("Error while listing neighborhoods:", e)
        return jsonify({"status": "error", "message": "Could not retrieve neighborhoods."}), 500
