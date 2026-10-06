export PATH=/opt/pg17full/postgresql-17.10.0-x86_64-unknown-linux-gnu/bin:$PATH PGHOST=/tmp PGPORT=5433 PGUSER=postgres
psql -q -c "DROP DATABASE IF EXISTS college_db WITH (FORCE);" -c "CREATE DATABASE college_db;" && psql -q -d college_db -f /home/user/kissatcart/dbms-lab/P3/sql/00_schema_from_P1_P2.sql
