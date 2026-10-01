from sqlalchemy import text
from app.database import engine

CREATE_TRIGGERS_SQL = """
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE OR REPLACE FUNCTION update_user_profile_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Concatenar automáticamente full_name cuando se actualizan first_name o last_name
    NEW.full_name := TRIM(CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')));
    -- Actualizar timestamp
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_profile ON users;

CREATE TRIGGER trg_update_user_profile
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_profile_trigger();
"""


def setup_triggers():
    """Ejecuta y garantiza la existencia del trigger en PostgreSQL."""
    try:
        with engine.connect() as conn:
            conn.execute(text(CREATE_TRIGGERS_SQL))
            conn.commit()
            print("Trigger trg_update_user_profile configurado exitosamente en PostgreSQL")
    except Exception as e:
        print(f"Error al configurar triggers: {e}")
