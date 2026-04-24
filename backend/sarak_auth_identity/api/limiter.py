from slowapi import Limiter
from slowapi.util import get_remote_address

# Instância base do limitador (v7.6)
# Utiliza o endereço IP remoto como chave para rastreamento.
limiter = Limiter(key_func=get_remote_address)
