# Pre requisite: node and postgresql installed

# enviroment variables
SECRET=`echo -n password | sha256sum | awk '{print toupper($1)}'`
sed 's:$SECRET:'$SECRET':' .env-sample > .env

# modules configs
mkdir src/app/config
cp src/app/server/config.json src/app/config/server.json
cp src/app/db/config.json src/app/config/datasource.json

