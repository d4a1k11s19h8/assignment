#!/bin/bash
export ORACLE_HOME=/opt/oracle/product/21c/dbhomeXE
export ORACLE_SID=XE
export PATH=$ORACLE_HOME/bin:$PATH

echo "startup;" | sqlplus -s / as sysdba

sqlplus c##my_new_user/your_password@localhost:1539/XEPDB1 @/mnt/c/Users/Daksh/Desktop/DBMS/database/schema.sql
sqlplus c##my_new_user/your_password@localhost:1539/XEPDB1 @/mnt/c/Users/Daksh/Desktop/DBMS/database/triggers.sql
sqlplus c##my_new_user/your_password@localhost:1539/XEPDB1 @/mnt/c/Users/Daksh/Desktop/DBMS/database/seed.sql
