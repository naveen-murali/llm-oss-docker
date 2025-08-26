# Ollama AI Service Docker Documentation

This project provides a Docker-based setup for running Ollama AI models with pre-configured Qwen models. The service includes both 1.7B and 4B parameter versions of the Qwen model.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB of available RAM (8GB recommended)
- At least 10GB of available disk space

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the project directory:**
   ```bash
   cd /path/to/your/project
   ```

2. **Start the services:**
   ```bash
   docker compose up -d
   ```

   This will start both models:
   - Qwen3 1.7B on port 11434
   - Qwen3 4B on port 11435

3. **Check service status:**
   ```bash
   docker compose ps
   ```

4. **View logs:**
   ```bash
   docker compose logs -f
   ```

### Option 2: Manual Docker Commands

#### Building the Docker Images

1. **Build Qwen3 1.7B model:**
   ```bash
   docker build -t ollama-qwen3-1.7b:1.0.0 .
   ```

2. **Build Qwen3 4B model:**
   ```bash
   docker build --build-arg OLLAMA_MODEL=qwen3:4b -t ollama-qwen3-4b:1.0.0 .
   ```

3. **Build with custom model:**
   ```bash
   docker build --build-arg OLLAMA_MODEL=your-model-name -t your-image-name:tag .
   ```

#### Running the Containers

1. **Run Qwen3 1.7B:**
   ```bash
   docker run -d --name ollama-qwen3-1.7b -p 11434:11434 \
     -e OLLAMA_HOST=0.0.0.0 \
     ollama-qwen3-1.7b:1.0.0
   ```

2. **Run Qwen3 4B:**
   ```bash
   docker run -d --name ollama-qwen3-4b -p 11435:11434 \
     -e OLLAMA_HOST=0.0.0.0 \
     ollama-qwen3-4b:1.0.0
   ```

## Service Configuration

### Ports
- **Qwen3 1.7B**: Port 11434
- **Qwen3 4B**: Port 11435

### Environment Variables
- `OLLAMA_HOST`: Set to `0.0.0.0` to allow external connections
- `OLLAMA_MODEL`: Model to load (set during build)

### Health Checks
The services include health checks that run every 30 seconds to ensure the Ollama API is responding correctly.

## Testing the Service

### Check API Status
```bash
# Test Qwen3 1.7B
curl http://localhost:11434/api/version

# Test Qwen3 4B
curl http://localhost:11435/api/version
```

### Test Model Generation
```bash
# Test Qwen3 1.7B
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:1.7b",
    "prompt": "Hello, how are you?",
    "stream": false
  }'

# Test Qwen3 4B
curl -X POST http://localhost:11435/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:4b",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

## Management Commands

### Stop Services
```bash
# Using Docker Compose
docker compose down

# Using Docker commands
docker stop ollama-qwen3-1.7b ollama-qwen3-4b
```

### Remove Containers
```bash
# Using Docker Compose
docker compose down --rmi all

# Using Docker commands
docker rm -f ollama-qwen3-1.7b ollama-qwen3-4b
```

### View Resource Usage
```bash
docker stats ollama-qwen3-1.7b ollama-qwen3-4b
```

### Access Container Shell
```bash
# Qwen3 1.7B
docker exec -it ollama-qwen3-1.7b /bin/sh

# Qwen3 4B
docker exec -it ollama-qwen3-4b /bin/sh
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :11434
   lsof -i :11435
   
   # Stop conflicting services
   docker stop $(docker ps -q)
   ```

2. **Container won't start:**
   ```bash
   # Check container logs
   docker logs ollama-qwen3-1.7b
   docker logs ollama-qwen3-4b
   ```

3. **Model not loading:**
   ```bash
   # Check if model is available
   docker exec -it ollama-qwen3-1.7b /bin/ollama list
   ```

4. **Out of memory:**
   - Ensure sufficient RAM is available
   - Consider using smaller models
   - Monitor with `docker stats`

### Logs and Debugging
```bash
# Follow logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs qwen3-1.7b
docker compose logs qwen3-4b

# Check container health
docker compose ps
```

## Performance Considerations

- **Memory**: Qwen3 1.7B requires ~4GB RAM, Qwen3 4B requires ~8GB RAM
- **CPU**: Multi-core CPU recommended for better performance
- **Storage**: SSD storage recommended for faster model loading
- **Network**: Local network recommended for API calls

## Security Notes

- The service exposes Ollama API endpoints
- Consider using reverse proxy with authentication for production use
- Default configuration allows external connections (OLLAMA_HOST=0.0.0.0)
- Restrict access using firewall rules if needed

## Development

### Building for Development
```bash
# Build with development optimizations
docker build --target development -t ollama-dev .

# Run development container
docker run -it --rm -p 11434:11434 ollama-dev
```

### Custom Models
To use different models, modify the `OLLAMA_MODEL` build argument:

```bash
docker build --build-arg OLLAMA_MODEL=llama2:7b -t ollama-llama2:latest .
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Docker and Ollama logs
3. Ensure system requirements are met
4. Verify network and port configurations

## License

This project is part of the AI Fielsta research and development initiative.
