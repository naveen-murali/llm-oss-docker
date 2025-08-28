# Multi‑Arch Docker Build & Push Guide (Mac **and** Linux)
**Project:** `naveentag/fiesta-ai` (private Docker Hub repo)  
**Image tags:** use the model name/version, e.g. `qwen3-1.7b`, `qwen3-4b`  
**Goal:** build **multi‑arch** images (`linux/amd64` + `linux/arm64`) that bake an Ollama model and push to Docker Hub.

---

## 0) Assumptions & Notes
- Docker Hub username: **`naveentag`**
- Private repo name: **`fiesta-ai`**
- Model tag format: **`qwen3-1.7b`**, **`qwen3-4b`** (i.e., replace the colon `:` in `qwen3:1.7b` with a hyphen for the image tag).
- Works on **macOS** (Apple Silicon or Intel) and **Linux**.
- If a model is gated (e.g., on Hugging Face), you may need `HF_TOKEN` at build time.
- On Linux, if your user isn’t in the `docker` group, prefix commands with `sudo`.

---

## 1) One‑time prerequisites (Mac & Linux)
```bash
# Ensure Docker is installed (Docker Desktop on Mac, Docker Engine on Linux).

# Enable/prepare buildx and emulation (QEMU) for multi-arch builds
docker buildx create --use --name multi || true
docker buildx inspect --bootstrap

# (Linux fallback if bootstrap fails; safe to skip if not needed)
# docker run --privileged --rm tonistiigi/binfmt --install all

# Login to Docker Hub (use a Personal Access Token if 2FA is enabled)
docker login -u naveentag
```

Optional (gated models):
```bash
export HF_TOKEN="<your-hf-token>"
```

---

## 2) Dockerfile (ready for multi‑arch & model pre‑pull)

> Save as `Dockerfile` in your build directory.

```dockerfile
FROM ollama/ollama:0.11.7

# Build-time knobs
ARG OLLAMA_MODEL=qwen3:1.7b
ARG TARGETARCH
ENV OLLAMA_HOST=127.0.0.1

# Small tools for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl procps   && rm -rf /var/lib/apt/lists/*

SHELL ["/bin/sh", "-lc"]

# Preload the model (works under buildx/QEMU for both amd64/arm64)
# If you ever see QEMU flakiness, see "Troubleshooting" to disable preloading.
RUN set -eux;     /bin/ollama serve & pid=$!;     for i in $(seq 1 120); do       curl -sf http://127.0.0.1:11434/api/version >/dev/null && break || sleep 1;     done;     echo "Pulling model ${OLLAMA_MODEL} for $TARGETARCH";     /bin/ollama pull "${OLLAMA_MODEL}";     kill -TERM "$pid";     wait "$pid" || true

EXPOSE 11434
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5   CMD curl -sf http://127.0.0.1:11434/api/version >/dev/null || exit 1

# Base image ENTRYPOINT is ["ollama"], so only pass "serve"
CMD ["serve"]
```

---

## 3) Build & push **one** model (multi‑arch)
Pick a model reference and an image tag:
- **Model reference** (build arg): e.g., `qwen3:1.7b`
- **Image tag** (repo tag): `qwen3-1.7b`

```bash
MODEL_REF="qwen3:1.7b"
TAG="${MODEL_REF/:/-}"  # "qwen3:1.7b" -> "qwen3-1.7b"

docker buildx build   --platform linux/amd64,linux/arm64   --build-arg OLLAMA_MODEL="$MODEL_REF"   --build-arg HF_TOKEN="$HF_TOKEN"   -t docker.io/naveentag/fiesta-ai:"$TAG"   --push .
```

Verify the pushed tag has *both* platforms:
```bash
docker buildx imagetools inspect docker.io/naveentag/fiesta-ai:"$TAG"
# Expect: Platforms: linux/amd64, linux/arm64
```

---

## 4) Build & push **many** models (loop)
```bash
# Add any models you want to bake:
MODELS=("qwen3:1.7b" "qwen3:4b")

for MODEL_REF in "${MODELS[@]}"; do
  TAG="${MODEL_REF/:/-}"   # e.g., "qwen3:4b" -> "qwen3-4b"
  echo ">>> Building $TAG ..."
  docker buildx build     --platform linux/amd64,linux/arm64     --build-arg OLLAMA_MODEL="$MODEL_REF"     --build-arg HF_TOKEN="$HF_TOKEN"     -t docker.io/naveentag/fiesta-ai:"$TAG"     --push .
  docker buildx imagetools inspect docker.io/naveentag/fiesta-ai:"$TAG" | sed -n '1,25p'
done
```

---

## 5) Local sanity test (optional)
```bash
docker run --rm -p 11434:11434   -e OLLAMA_HOST=0.0.0.0:11434   docker.io/naveentag/fiesta-ai:qwen3-1.7b

# In another terminal:
curl -s http://localhost:11434/api/version
curl -s http://localhost:11434/api/generate   -d '{"model":"qwen3:1.7b","prompt":"Say hi"}'
```

---

## 6) Naming & labeling tips
- Tags = **model/version**: `qwen3-1.7b`, `qwen3-4b`.
- Optional immutable tags: `qwen3-1.7b-YYYYMMDD`.
- Add OCI labels for traceability when building:
```bash
--label org.opencontainers.image.title="fiesta-ai" --label org.opencontainers.image.description="Ollama server with ${MODEL_REF}" --label org.opencontainers.image.source="https://github.com/your/repo" --label org.opencontainers.image.version="${TAG}" --label org.opencontainers.image.created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## 7) Troubleshooting (fast fixes)
- **`no match for platform in manifest`**  
  You pushed only arm64. Rebuild with `--platform linux/amd64,linux/arm64` and `--push`.

- **Gated model pull fails (401)**  
  Pass `--build-arg HF_TOKEN="$HF_TOKEN"` and ensure the account has accepted the model license.

- **Multi‑arch build too slow / QEMU flaky**  
  Temporarily **disable preloading** and let the model download at first run. For example:
  ```dockerfile
  ARG PRELOAD=1
  RUN if [ "$PRELOAD" = "1" ]; then
      /bin/ollama serve & pid=$!;       for i in $(seq 1 120); do curl -sf http://127.0.0.1:11434/api/version >/dev/null && break || sleep 1; done;       /bin/ollama pull "${OLLAMA_MODEL}";       kill -TERM "$pid"; wait "$pid" || true;     fi
  ```
  Then build with `--build-arg PRELOAD=0`.

- **Huge image / slow pulls**  
  Baked‑model images are large. Keep layers lean; consider pushing to a registry close to your runtime (e.g., DOCR for DOKS/App Platform).

---

## 8) Makefile (quality‑of‑life)

> Save as `Makefile` in your project root.

```makefile
# Makefile
REGISTRY = docker.io
USER     = naveentag
REPO     = fiesta-ai
PLATFORMS = linux/amd64,linux/arm64

# Space-separated list of model refs to build
MODELS = qwen3:1.7b qwen3:4b

.PHONY: buildx
buildx:
	@docker buildx create --use --name multi || true
	@docker buildx inspect --bootstrap

.PHONY: login
login:
	@docker login -u $(USER)

# Build & push all models declared in MODELS
.PHONY: push-all
push-all: buildx
	@for M in $(MODELS); do 	  TAG=$${M/:/-}; 	  echo ">>> Building $$M -> $(REGISTRY)/$(USER)/$(REPO):$$TAG"; 	  docker buildx build 	    --platform $(PLATFORMS) 	    --build-arg OLLAMA_MODEL="$$M" 	    --build-arg HF_TOKEN="$$HF_TOKEN" 	    -t $(REGISTRY)/$(USER)/$(REPO):$$TAG 	    --push . || exit 1; 	  docker buildx imagetools inspect $(REGISTRY)/$(USER)/$(REPO):$$TAG | sed -n '1,20p'; 	done

# Build & push one model: make push MODEL=qwen3:1.7b
.PHONY: push
push: buildx
	@[ -n "$(MODEL)" ] || (echo "Set MODEL=<model:ver> e.g. qwen3:1.7b"; exit 2)
	@TAG=$${MODEL/:/-}; 	echo ">>> Building $(MODEL) -> $(REGISTRY)/$(USER)/$(REPO):$$TAG"; 	docker buildx build 	  --platform $(PLATFORMS) 	  --build-arg OLLAMA_MODEL="$(MODEL)" 	  --build-arg HF_TOKEN="$(HF_TOKEN)" 	  -t $(REGISTRY)/$(USER)/$(REPO):$$TAG 	  --push .
```

Usage:
```bash
# Optional: export your HF token if needed
export HF_TOKEN=...

make login
make push-all              # builds & pushes all in MODELS

# or build one:
make push MODEL=qwen3:4b
```

---

## 9) Deployment reminders (App Platform / DOKS)
- **App Platform**: either set component **HTTP Port = 11434** and `OLLAMA_HOST=0.0.0.0:11434`, **or** keep HTTP Port 8080 and set `OLLAMA_HOST=0.0.0.0:8080`. Health check must hit `/api/version` on the same port.
- **DOKS**: reference the image as `docker.io/naveentag/fiesta-ai:<tag>`, add an image pull secret for your private repo, and set CPU/RAM requests to fit your node (e.g., 4 vCPU / 8 GiB presets).
