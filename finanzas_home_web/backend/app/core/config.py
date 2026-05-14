from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Finanzas_Home_API"
    app_env: str = "development"
    db_driver: str = "ODBC Driver 18 for SQL Server"
    db_server: str = "127.0.0.1"
    db_port: int = 1433
    db_name: str = "Finanzas_Home"
    db_user: str = "sa"
    db_password: str = ""
    db_trust_server_certificate: str = "yes"
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
