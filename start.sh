folder_name="shared" 

folder_path=$(find . -maxdepth 1 -type d -name "$folder_name")
rm -rf ./nest/backend/shared 2>>/dev/null
rm -rf ./react/frontend/shared 2>>/dev/null
absolute_path=$(realpath "$folder_path")
ln -s $absolute_path ./nest/backend
ln -s $absolute_path ./react/frontend
mkdir -p ./nest/backend/public/avatar
docker compose up --build