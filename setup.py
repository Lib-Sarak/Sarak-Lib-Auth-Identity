from setuptools import setup, find_packages

setup(
    name="sarak-auth-identity",
    version="1.0.0",
    packages=find_packages(where="backend"),
    package_dir={"": "backend"},
    install_requires=[
        "sqlalchemy",
        "python-jose[cryptography]",
        "pydantic",
        "supabase",
        "fastapi",
        "passlib[bcrypt]",
        "bcrypt"
    ],
    author="Igor Sarak",
    description="Módulo de Identidade e Autenticação Base (Sarak Library)",
)
