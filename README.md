
# Information for running containers in docker and fresh install

## Stop all containers
docker-compose down

## Remove all cached images
docker system prune -a

## Remove all volumes
docker volume prune

## Force rebuild without cache
docker-compose build --no-cache