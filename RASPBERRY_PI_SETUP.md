# Raspberry Pi 5 setup

These instructions deploy the educational website, not the separate Node-RED runtime used for exercises. Use Raspberry Pi OS **64-bit** and a reliable power supply. An SSD is useful for persistent database data and backups.

## 1. Prepare the Pi

Install Raspberry Pi OS 64-bit using Raspberry Pi Imager. Configure a unique user, networking and optionally SSH. Log in and run:

```sh
sudo apt update
sudo apt full-upgrade -y
uname -m
hostname -I
```

`uname -m` should show `aarch64`. Note the current LAN IP; it may change. A DHCP reservation or a working mDNS hostname can give the professor a stable address.

## 2. Install Docker and Compose

Follow the official [Docker Debian instructions](https://docs.docker.com/engine/install/debian/) for ARM64. Docker specifically directs 64-bit Raspberry Pi OS users to the Debian ARM64 packages.

On a fresh supported Raspberry Pi OS installation:

```sh
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian ${VERSION_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
```

The commands below use `sudo docker`; membership in the docker group is optional and grants powerful host access. No npm installation is required on the Pi when building everything in Docker.

## 3. Copy the project

Clone your own repository or securely copy the source folder to the Pi. Do not copy Windows `node_modules`, `.angular`, or build caches.

```sh
mkdir -p ~/projects
cd ~/projects
# Clone your own repository here, or copy the project to node-red-guide.
cd node-red-guide
```

If this is a fresh deployment, create a private environment file using a temporary Node container:

```sh
sudo docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/app" -w /app node:22-alpine node scripts/setup-env.mjs
chmod 600 .env
nano .env
```

Set ADMIN_EMAIL. For LAN administration set `CMS_BIND_ADDRESS=0.0.0.0`, `DIRECTUS_PUBLIC_URL=http://CURRENT_PI_IP:8055`, and `FRONTEND_URL=http://CURRENT_PI_IP`. Leave SITE_PORT=80 unless needed otherwise. Keep `DIRECTUS_URL=http://directus:8055` for the container network.

For an existing deployment being transferred, restore its database, uploads and original private `.env` together instead of generating new application secrets.

## 4. Start PostgreSQL and Directus

```sh
sudo docker compose up -d postgres directus
sudo docker compose ps
sudo docker compose logs --tail 50 directus
```

Wait for both containers to be healthy. Verify PostgreSQL without printing its password:

```sh
sudo docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Visit `http://CURRENT_PI_IP:8055/admin` from another computer on the same trusted network. Sign in with the separate Directus admin credentials from `.env`.

## 5. Set up collections and start the website

```sh
sudo docker compose --profile setup run --rm cms-setup
sudo docker compose up -d --build
sudo docker compose ps
curl --fail http://localhost/api/health
curl --fail http://localhost/ -o /dev/null
```

Verify:

1. PostgreSQL is healthy.
2. Directus Admin opens and shows all eleven collections.
3. `/api/health` returns status `ok` and content `directus`.
4. The website opens at `http://CURRENT_PI_IP/`.
5. A lesson opens directly by URL, not only through the homepage.
6. Publish a screenshot and confirm the frontend displays it.
7. Add a real YouTube URL, save, wait five seconds and reload.
8. Draft a test lesson and verify anonymous readers cannot access it or its children.

The Dockerfiles use standard multi-architecture Node, PostgreSQL, Directus and Nginx images without forcing AMD64. Build on the Pi to select ARM64. Hardware operation and image support must be checked on the actual Pi before classroom use.

## 6. Startup after reboot and address changes

Docker starts through systemd. Application services use `restart: unless-stopped`. After initial startup, schedule a reboot:

```sh
sudo reboot
```

Reconnect, run `hostname -I`, then `sudo docker compose ps` from the project directory. Visit the current IP from the professor's computer. Angular uses relative `/api` URLs, so the website does not need recompilation when the IP changes. Update DIRECTUS_PUBLIC_URL in `.env` when necessary and run `sudo docker compose up -d directus`.

These plain HTTP URLs are for a trusted school LAN. If exposing the service beyond it, configure HTTPS and appropriate network access; do not publish the PostgreSQL port.

## 7. Back up database and uploads

Keep backups off the Pi as well. Run from the project root in **Bash on the Pi**. Stop content writes while capturing both parts so file references and uploads agree:

```sh
mkdir -p backups
backup_stamp=$(date +%Y%m%d-%H%M%S)
sudo docker compose stop frontend backend directus
sudo docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "backups/database-$backup_stamp.dump"
sudo docker run --rm -v node-red-guide_directus_uploads:/uploads:ro -v "$PWD/backups:/backup" alpine:3.22 tar -czf "/backup/uploads-$backup_stamp.tar.gz" -C /uploads .
cp .env "backups/environment-$backup_stamp.env"
chmod 600 "backups/environment-$backup_stamp.env"
sudo docker compose start directus backend frontend
```

Check command exit codes and verify the files are nonempty. The database dump is binary: do not use Windows PowerShell 5 redirection for it. On Windows, write the dump inside the container and use `docker compose cp` instead. The Compose project name fixes the uploads volume name shown above.

## 8. Restore on a fresh target

Restore to a fresh deployment first; the database restore below intentionally does not drop existing tables. On an already-used target, perform an explicit recovery plan instead of blindly overwriting it.

1. Copy the same source version, backup files and backed-up `.env` to the target.
2. Restore `.env` privately before starting containers. Preserve the original database account and Directus secret.
3. Start only PostgreSQL, then restore into the empty application database:

```sh
sudo docker compose up -d postgres
# Replace filenames with your selected matching backup pair.
sudo docker compose cp backups/database-YYYYMMDD-HHMMSS.dump postgres:/tmp/guide.dump
sudo docker compose exec postgres sh -c 'pg_restore --exit-on-error --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" /tmp/guide.dump'
sudo docker volume create node-red-guide_directus_uploads
sudo docker run --rm -v node-red-guide_directus_uploads:/uploads -v "$PWD/backups:/backup:ro" alpine:3.22 tar -xzf /backup/uploads-YYYYMMDD-HHMMSS.tar.gz -C /uploads
sudo docker compose up -d --build
```

Do not rerun the seed importer just to restore a complete database. Verify admin login, a restored lesson and its screenshot. Store the recovery date and outcome with your backup log.

## 9. Routine maintenance

- Use `sudo docker compose logs --tail 100 SERVICE` for diagnostics.
- Keep free storage space available for PostgreSQL and images.
- Back up before changing image versions or schema.
- `docker compose down` stops services while preserving named volumes. `down -v` removes data volumes: do not use it for ordinary shutdown.
- Review `docs/VERIFICATION.md` before the professor's handoff.
