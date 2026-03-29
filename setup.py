from setuptools import setup, find_packages

setup(
    name="sarak-auth-identity",
    version="1.0.0",
    packages=find_packages(where="backend"),
    package_dir={"": "backend"},
    install_requires=[
        "sqlalchemy",
        "psycopg2-binary",
        "python-jose[cryptography]",
        "pydantic",
        "pydantic-settings",
        "python-dotenv",
        "python-multipart",
        "supabase",
        "fastapi",
        "passlib[bcrypt]",
        "bcrypt"
    ],
    author="Igor Sarak",
    description="Módulo de Identidade e Autenticação Base (Sarak Library)",
)
