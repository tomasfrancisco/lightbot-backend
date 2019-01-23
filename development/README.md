# Development docker compose setup

SQL interface is available at localhost:8080

If login doesn't work execute the following:

```
docker ps // To find the container_id for lightbotDB
docker exec -it container_id bash
mysql -u root -p root
```

Execute the following sql statements

```mysql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
```
