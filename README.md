# Navigation application

Navigation application that uses OpenVPS architecture.

## Installing dependencies and starting the application

1. Install docker engine. For Ubuntu, use instructions [from here](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).
2. Run `docker compose up --detach`. To print logs, run `docker compose logs`. To shutdown, `docker compose down`.

To run jupyter lab inside the docker container: 
- Get the container ID by running `docker ps`.
- Attach the terminal to the container bu running: `docker exec -it <container_id> bash`.
- Once inside the container, run: `jupyter lab --allow-root --ip 0.0.0.0`.
