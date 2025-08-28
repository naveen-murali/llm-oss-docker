echo "[Installing pre-requisites]..."

# Docker Desktop 24+ (includes buildx). Then:
docker buildx create --use --name multi || true
docker buildx inspect --bootstrap

# Login to Docker Hub (use a PAT if you have 2FA)
echo "[Logging in to Docker Hub]..."
docker login -u naveentag

echo "[Building models]..."

# List whatever models you want to bake:
MODELS=("qwen3:1.7b" "qwen3:4b" "deepseek-r1:1.5b" "llama3.2:3b" "gemma3n:e2b")

# list available models with number of models
echo -e "\nAvailable models:"
for MODEL_IDX in "${!MODELS[@]}"; do
  echo "$((MODEL_IDX + 1)): ${MODELS[${MODEL_IDX}]}"
done
echo ""

# Loop through the models and build them
for MODEL_REF in "${MODELS[@]}"; do
  # Replace : with - in the model name
  TAG="${MODEL_REF/:/-}"   # "qwen3:4b" -> "qwen3-4b"
  echo -e "\n>>> [Building] $TAG ..."

  # Build the model
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --build-arg OLLAMA_MODEL="$MODEL_REF" \
    -t docker.io/naveentag/fiesta-ai:"$TAG" \
    --push .

  # NOTE: For HuggingFace models, add the HF_TOKEN as an environment variable
  # --build-arg HF_TOKEN="$HF_TOKEN" \ # only if the model is from HuggingFace

  # Inspect the model
  docker buildx imagetools inspect docker.io/naveentag/fiesta-ai:"$TAG" | sed -n '1,25p'
done