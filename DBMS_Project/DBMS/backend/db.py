import oracledb
import os
from dotenv import load_dotenv

load_dotenv()

_pool: oracledb.AsyncConnectionPool | None = None


async def get_pool() -> oracledb.AsyncConnectionPool:
    global _pool
    if _pool is None:
        _pool = oracledb.create_pool_async(
            user=os.getenv("DB_USER", "clinic_user"),
            password=os.getenv("DB_PASSWORD", ""),
            dsn=os.getenv("DB_DSN", "localhost:1521/XEPDB1"),
            min=2,
            max=10,
            increment=1,
        )
    return _pool


async def get_connection():
    pool = await get_pool()
    return await pool.acquire()
