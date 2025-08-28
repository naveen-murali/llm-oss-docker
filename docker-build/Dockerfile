FROM ollama/ollama:0.11.7

ARG OLLAMA_MODEL=qwen3:1.7b
ENV OLLAMA_HOST=127.0.0.1

RUN apt-get update && apt-get install -y --no-install-recommends curl procps && rm -rf /var/lib/apt/lists/*

SHELL ["/bin/sh", "-lc"]

# Preload the model (CPU). Note the explicit /bin/ollama path.
RUN set -eux; \
    /bin/ollama serve & pid=$!; \
    for i in $(seq 1 90); do \
      curl -sf http://127.0.0.1:11434/api/version >/dev/null && break || sleep 1; \
    done; \
    echo "Pulling model ${OLLAMA_MODEL}"; \
    /bin/ollama pull "${OLLAMA_MODEL}"; \
    if kill -0 "$pid" 2>/dev/null; then \
      kill -TERM "$pid" 2>/dev/null || true; \
      wait "$pid" || true; \
    fi
    # or
    # kill -TERM "$pid"; \
    # wait "$pid" || true



EXPOSE 11434
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -sf http://127.0.0.1:11434/api/version >/dev/null || exit 1

# IMPORTANT: only "serve" here — ENTRYPOINT already = "ollama"
CMD ["serve"]
