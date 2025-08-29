Here’s a clean, copy-pasteable Ubuntu guide.

# 1) Install Docker (Engine) — Ubuntu

```bash
# 0) Remove old Docker bits (safe if none installed)
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# 1) Prereqs
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 2) Add Docker’s official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3) Set up the apt repository (jammy works for 22.04; use your codename if different: $(. /etc/os-release; echo $VERSION_CODENAME))
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release; echo $VERSION_CODENAME) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4) Install Docker Engine + CLI + Containerd
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# 5) Enable & start, and allow your user to run docker without sudo (log out/in once)
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

# 6) Verify
docker --version
docker run --rm hello-world
```

### (Optional) Install Docker Compose v2 (plugin)

```bash
sudo apt-get install -y docker-compose-plugin
docker compose version   # note: it's 'docker compose', not 'docker-compose'
```

---

# 2) Install Nginx + reverse proxy config (`proxy_pass`)

## Install Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx

# (Optional) open firewall if UFW is enabled
sudo ufw allow 'Nginx Full' || true

# Start & enable
sudo systemctl enable --now nginx
```

## Create a reverse proxy server block

Below are two common patterns. Pick ONE and adjust `server_name` and backend URL.

### A) Reverse proxy the whole site to a single backend (e.g., service on 11434)

```bash
sudo tee /etc/nginx/sites-available/fiesta-ai <<'NGINX'
server {
    listen 80;
    server_name your-domain.example.com; # or _ for any host

    # Good defaults for LLM/SSE streaming
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_buffering off;

    # WebSocket upgrade (harmless if not used)
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    location / {
        proxy_pass http://127.0.0.1:11434;   # <-- your backend (Docker/K8s node port/service)
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;
        client_max_body_size 50M;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/fiesta-ai /etc/nginx/sites-enabled/fiesta-ai
sudo nginx -t && sudo systemctl reload nginx
```

### B) Path-based routing to different backends (two models/services)

```bash
sudo tee /etc/nginx/sites-available/fiesta-ai <<'NGINX'
server {
    listen 80;
    server_name your-domain.example.com;

    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_buffering off;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    # /qwen3-1.7b → backend A
    location /qwen3-1.7b/ {
        proxy_pass http://127.0.0.1:11434/;  # adjust to your service A
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;
        client_max_body_size 50M;
    }

    # /qwen3-4b → backend B (example: different port/host)
    location /qwen3-4b/ {
        proxy_pass http://127.0.0.1:21434/;  # adjust to your service B
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;
        client_max_body_size 50M;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/fiesta-ai /etc/nginx/sites-enabled/fiesta-ai
sudo nginx -t && sudo systemctl reload nginx
```

> Notes
> • Replace `your-domain.example.com` with your domain (or use `_` to match all).
> • If your upstream speaks HTTPS, use `proxy_pass https://…;` and consider `proxy_ssl_server_name on;`.
> • For **Kubernetes**, you’d typically use an Ingress rather than raw Nginx on a node—but these directives are the same under the hood.

### (Optional) Enable HTTPS with Let’s Encrypt (quick)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example.com
# certbot will edit the Nginx server block to add SSL and reload Nginx
```

---

## Quick tests

* Docker:

  ```bash
  docker run --rm hello-world
  ```
* Nginx config:

  ```bash
  nginx -t
  systemctl status nginx
  curl -I http://your-domain.example.com/   # should return 200/301
  ```
* Reverse proxy (pointing to Ollama or any backend):

  ```bash
  curl http://your-domain.example.com/api/version
  ```
