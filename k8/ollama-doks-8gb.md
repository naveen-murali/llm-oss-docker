# Deploying Ollama (Qwen3‑1.7B) to DigitalOcean Kubernetes — **4 vCPUs / 8 GiB RAM / 50 GiB Storage**

This is a complete, production‑ready runbook for deploying your **Ollama (Qwen3‑1.7B)** image to **DigitalOcean Kubernetes (DOKS)** sized for **4 vCPUs / 8 GiB RAM / 50 GiB storage**. It includes: multi‑arch image build (Mac → amd64), resource sizing that actually fits nodes, clean YAML, exact commands, and edge‑case troubleshooting (platform mismatch, private registry auth, scheduling/OOM, LB quirks).

---

## 1) Build & push a **multi‑arch** image (Mac)

**Why**: Your Mac is **arm64**, DOKS nodes are typically **amd64**. If you don’t push both, Kubernetes errors with `no match for platform in manifest`.

```bash
# One-time: enable buildx + QEMU
docker buildx create --use --name multi || true
docker buildx inspect --bootstrap

# Log in to Docker Hub
docker login

# Build & push both arches under the SAME tag
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t naveentag/ollama-qwen3:1.7b \
  --push .
```

Verify platforms:
```bash
docker buildx imagetools inspect docker.io/naveentag/ollama-qwen3:1.7b
# Expect: linux/amd64 and linux/arm64 entries
```

> Tip: if multi‑arch build is slow because your Dockerfile pre‑pulls the model, temporarily remove the pre‑pull step, push multi‑arch, and let the pod pull on first start (use the PVC below so it caches).

---

## 2) Connect your **Mac** to DOKS

```bash
brew install doctl kubectl

doctl auth init
doctl kubernetes cluster kubeconfig save <YOUR_CLUSTER_NAME>

kubectl config current-context
kubectl get nodes
```

---

## 3) Namespace + private Docker Hub secret

```bash
kubectl create namespace ollama

# If Docker Hub has 2FA, use a Personal Access Token as the password.
kubectl -n ollama create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username="naveentag" \
  --docker-password="<DH_ACCESS_TOKEN_OR_PASSWORD>" \
  --docker-email="you@example.com"
```

---

## 4) **Resource sizing** for 4 vCPUs / 8 GiB nodes

Typical **allocatable** on an 8 GiB node is ~**7.2–7.5 GiB RAM** and ~**3900–3950m CPU** after system pods. We’ll set **requests = limits** (QoS *Guaranteed*) just below allocatable, so your pod gets the node.

> **Check your actual allocatable** (recommended once):
```bash
NODE=$(kubectl get nodes -o name | head -n1 | sed 's|node/||')
kubectl describe node "$NODE" | sed -n '/Allocatable/,/Capacity/p'
```

**Safe defaults** that fit most 8 GiB / 4 vCPU nodes:
- CPU: **3800m**
- Memory: **7200Mi**

You can adjust these up/down by ~100–300m/MB to match your node’s allocatable.

---

## 5) Kubernetes manifests (no scripts inside)

### a) **Deployment** (`deploy-ollama-8g.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: ollama
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      imagePullSecrets:
        - name: regcred
      containers:
        - name: api
          image: naveentag/ollama-qwen3:1.7b
          imagePullPolicy: IfNotPresent
          env:
            - name: OLLAMA_HOST
              value: "0.0.0.0:11434"
            - name: OLLAMA_KEEP_ALIVE
              value: "-1"              # keep model hot in RAM
            - name: OLLAMA_MAX_LOADED_MODELS
              value: "1"               # only one model resident
            - name: OLLAMA_NUM_PARALLEL
              value: "1"               # 1 request at a time (raise later if CPU allows)
          ports:
            - containerPort: 11434
          readinessProbe:
            httpGet:
              path: /api/version
              port: 11434
            initialDelaySeconds: 20
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 12
          livenessProbe:
            httpGet:
              path: /api/version
              port: 11434
            initialDelaySeconds: 60
            periodSeconds: 10
            timeoutSeconds: 3
          resources:
            # Guaranteed QoS: requests = limits
            requests:
              cpu: "3800m"
              memory: "7200Mi"
            limits:
              cpu: "3800m"
              memory: "7200Mi"
```

> If your node reports allocatable slightly lower, drop to `cpu: 3700m`, `memory: 7000Mi` and re‑apply. If higher, you can push to `cpu: 3900m`, `memory: 7400Mi` for “max”.

### b) **Service** (`svc-ollama.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ollama
  namespace: ollama
spec:
  type: LoadBalancer
  selector:
    app: ollama
  ports:
    - name: http
      port: 11434
      targetPort: 11434
```

### c) **PVC (50 Gi)** for persistent models (`pvc-ollama-50g.yaml`)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-data
  namespace: ollama
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 50Gi
  storageClassName: do-block-storage
```

**Mount the PVC** (add to the Deployment if you want persistence):
```yaml
# under containers[0]
volumeMounts:
  - name: ollama-data
    mountPath: /root/.ollama
# under spec.template.spec
volumes:
  - name: ollama-data
    persistentVolumeClaim:
      claimName: ollama-data
```

> ⚠️ Mounting `/root/.ollama` overlays the baked model path, so the baked model will not be “visible”. First boot will re‑download into the volume.

**Optional**: seed the PVC from your baked image so it won’t re‑download (initContainer):
```yaml
initContainers:
  - name: seed-models
    image: naveentag/ollama-qwen3:1.7b
    command: ["/bin/sh","-lc"]
    args:
      - >
        if [ -z "$(ls -A /data)" ]; then
          cp -a /root/.ollama/* /data/ || true;
        fi
    volumeMounts:
      - name: ollama-data
        mountPath: /data
```

---

## 6) Apply & test

```bash
kubectl apply -f pvc-ollama-50g.yaml      # optional, if using persistence
kubectl apply -f deploy-ollama-8g.yaml
kubectl apply -f svc-ollama.yaml

kubectl -n ollama rollout status deploy/ollama
kubectl -n ollama get pods -w
kubectl -n ollama get svc ollama
```

Test:
```bash
IP=$(kubectl -n ollama get svc ollama -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -s "http://$IP:11434/api/version"
curl -s "http://$IP:11434/api/generate" -d '{"model":"qwen3:1.7b","prompt":"Hello from 8Gi/4vCPU node"}'
```

---

## 7) Logs & live activity

```bash
kubectl -n ollama logs deploy/ollama -f
kubectl -n ollama get events --watch
kubectl -n ollama describe pod -l app=ollama | sed -n '/Limits/,/Events/p'
kubectl -n ollama top pod              # if metrics-server is enabled
```

---

## 8) Common edge cases (and exact fixes)

### A) **ImagePullBackOff**
- **Platform mismatch** (`no match for platform in manifest`) → push **multi‑arch** (Section 1).  
- **Wrong tag** (`manifest unknown`) → verify tag exists; `docker pull` locally.  
- **Private repo auth** (`unauthorized`) → recreate `regcred` with correct username + PAT/password.

**Credential sanity checks**
```bash
# What K8s stored:
kubectl -n ollama get secret regcred -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d

# In-cluster pull test with the same secret:
kubectl -n ollama run cred-check \
  --image=naveentag/ollama-qwen3:1.7b \
  --restart=Never \
  --image-pull-policy=Always \
  --overrides='{"spec":{"imagePullSecrets":[{"name":"regcred"}]}}'
kubectl -n ollama describe pod cred-check | sed -n '/Events:/,$p'
kubectl -n ollama delete pod cred-check
```

### B) **Insufficient memory / CPU** (pod Pending)
- Your **requests** must be ≤ node **allocatable** minus what’s already reserved.  
- Check allocatable:
  ```bash
  NODE=$(kubectl get nodes -o name | head -n1 | sed 's|node/||')
  kubectl describe node "$NODE" | sed -n '/Allocatable/,/Capacity/p'
  ```
- Reduce requests a bit (e.g., `cpu: 3700m`, `memory: 7000Mi`) and re‑apply.

### C) **Preemption: No victims found**
- Scheduler can’t evict kube‑system pods to make room. Reduce **requests** or use a bigger node / second node.

### D) **LB events show 403 while provisioning**
- Normal during DigitalOcean LB creation; will say **EnsuredLoadBalancer** when done.

### E) **Readiness/Liveness failing on first boot (CPU cold start)**
- Increase initial delays:
  ```bash
  kubectl -n ollama patch deploy/ollama --type='json' -p='[
    {"op":"replace","path":"/spec/template/spec/containers/0/readinessProbe/initialDelaySeconds","value":30},
    {"op":"replace","path":"/spec/template/spec/containers/0/livenessProbe/initialDelaySeconds","value":90}
  ]'
  ```

### F) **OOMKilled**
- The process tried to exceed **limits.memory**. Either raise the limit, or set:
  ```bash
  kubectl -n ollama set env deploy/ollama OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1
  ```
  and keep `KEEP_ALIVE=-1` (or `0` if you must free RAM between calls).

### G) **CORS / browser call fails**
- Allow your web origin:
  ```bash
  kubectl -n ollama set env deploy/ollama OLLAMA_ORIGINS="https://app.example.com"
  ```

### H) **Force re‑pull after updating the image**
```bash
kubectl -n ollama patch deploy/ollama --type='json' -p='[
  {"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"Always"}
]'
kubectl -n ollama rollout restart deploy/ollama
```

---

## 9) Change knobs without editing files

```bash
# Resources (e.g., bump to near‑allocatable)
kubectl -n ollama set resources deploy/ollama \
  --requests=cpu=3800m,memory=7200Mi --limits=cpu=3800m,memory=7200Mi

# Ollama behavior (concurrency/keep‑alive/models)
kubectl -n ollama set env deploy/ollama \
  OLLAMA_KEEP_ALIVE=-1 OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1
```

---

## 10) Reset / teardown

```bash
# App
kubectl delete -n ollama service ollama || true
kubectl delete -n ollama deployment ollama || true
kubectl delete -n ollama pvc ollama-data || true
kubectl delete namespace ollama || true

# Nodes (cost control): scale pool or delete cluster
doctl kubernetes cluster list
doctl kubernetes node-pool list <CLUSTER_ID>
doctl kubernetes node-pool update <CLUSTER_ID> <POOL_ID> --count 0
# or: doctl kubernetes cluster delete <CLUSTER_ID>
```

---

### Appendix — Why specific commands matter (quick map)

- `docker buildx build --platform … --push` → builds multi‑arch and pushes to Docker Hub.  
- `docker buildx imagetools inspect TAG` → shows which platforms a tag supports.  
- `doctl auth init` → logs DO CLI in (stores token locally).  
- `doctl k8s cluster kubeconfig save NAME` → merges DOKS credentials into `~/.kube/config`.  
- `kubectl create namespace …` → isolates your app in its own logical space.  
- `kubectl create secret docker-registry …` → stores Docker Hub creds for private pulls.  
- `kubectl apply -f FILE` → creates/updates resources from YAML.  
- `kubectl get pods -w` → watch live status; `READY 1/1` means serving.  
- `kubectl logs deploy/ollama -f` → tail app logs.  
- `kubectl get events --watch` → live activity feed (scheduling, probes, LB).  
- `kubectl describe node …` → shows allocatable CPU/RAM; use to size requests.  
- `kubectl delete …` → removes resources; `doctl` commands scale/delete nodes/clusters.
