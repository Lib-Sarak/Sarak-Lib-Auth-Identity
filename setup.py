from setuptools import setup, find_packages

setup(
    name="sarak-lib-auth-identity",
    version="1.0.0",
    packages=find_packages(where="backend"),
    package_dir={"": "backend"},
    install_requires=[
        "sqlalchemy",
        "psycopg2-binary",
        "python-jose[cryptography]",
        "pydantic[email]",
        "pydantic-settings",
        "python-dotenv",
        "fastapi",
        "passlib[bcrypt]",
        "bcrypt",
        "email-validator",
        "slowapi",
        "pyotp",
        "qrcode",
        "httpx-oauth",
        "httpx"
    ],
    author="Igor Sarak",
    description="Módulo de Identidade e Autenticação Base (Sarak Library)",
)
