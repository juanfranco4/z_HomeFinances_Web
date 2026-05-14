from sqlalchemy import create_engine
from app.core.config import settings

def build_connection_string() -> str:
    return (
        f"mssql+pyodbc://{settings.db_user}:{settings.db_password}"
        f"@{settings.db_server}:{settings.db_port}/{settings.db_name}"
        f"?driver={settings.db_driver.replace(' ', '+')}"
        f"&TrustServerCertificate={settings.db_trust_server_certificate}"
    )

engine = create_engine(build_connection_string(), pool_pre_ping=True)
