from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Finanzas_Home_API"
    app_env: str = "development"
    db_driver: str = "ODBC Driver 18 for SQL Server"
    db_server: str = "10.0.0.12"
    db_port: int = 1433
    db_name: str = "Finanzas_Home"
    db_user: str = "sa"
    db_password: str = "Solomo33**"
    db_trust_server_certificate: str = "yes"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
