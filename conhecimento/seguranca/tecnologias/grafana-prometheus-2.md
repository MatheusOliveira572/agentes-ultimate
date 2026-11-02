<!-- Adaptado de usestrix/strix/strix/skills/technologies/grafana_prometheus.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-tecnologias-grafana-prometheus-2; palavras=seguranca grafana parte 2, prometheus exposto parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia seguranca grafana parte 2 do guia | leia prometheus exposto parte 2 do guia; nao=calcule a folha de pagamento do mês -->
## Testing Methodology

1. **Discover** stack ports/services (`:3000/:9090/:9093/:9100/:3100/:16686`, `/metrics`, `/api/health`).
2. **Fingerprint versions** → shortlist applicable CVEs (43798, 9264, 4123, 39226/1313, Infinity 8341).
3. **Auth matrix** — unauth vs anon vs viewer vs default creds vs leaked token, per component.
4. **Recon-pivot** — pull Prometheus config/targets + PromQL inventory; enumerate Grafana `/api/datasources`.
5. **SSRF-pivot** — data source proxy / render / webhook → internal services + `169.254.169.254`.
6. **Credential-pivot** — file read (43798) → `secret_key` → decrypt `grafana.db`; scrape/remote_write/receiver creds; then reuse against each backend.
7. **Deepen** — RCE (9264 if `duckdb` present), cloud account via metadata, k8s SA token, DB access; demonstrate real impact.

## Validation

- SSRF: show the **full body** of an internal-only URL (metadata creds, internal API JSON) returned through Grafana — not just a timing/blind signal.
- Credential theft: show the leaked secret AND prove reuse (authenticate to the backend / cloud), or clearly explain the reuse path.
- File read (43798): return contents of `/etc/passwd` or `grafana.ini` with `--path-as-is`; note affected version.
- RCE (9264): confirm `duckdb` in PATH first; demonstrate command execution or file read; note version 11.x.
- Recon: for Prometheus/Alertmanager exposure, pair the open endpoint with the concrete sensitive data recovered (leaked creds, internal inventory) so the finding shows impact, not just "it's reachable".

## False Positives / Down-rate

- Endpoint reachable only from localhost / same trusted segment by design, behind an authenticating reverse proxy (test through the real ingress).
- Grafana Enterprise (real URL validator) or OSS with a configured `data_source_proxy_whitelist` → SSRF blocked.
- CVE-2024-9264 with **no `duckdb` in PATH** → not exploitable (do not report as RCE).
- Patched versions (Grafana ≥ the fixed release for each CVE; check `/api/health`).
- **Demo/sandbox instances with synthetic data** — down-rate per demo-data guidance; exposed monitoring of a throwaway target is low impact.
- Metrics that are genuinely public/non-sensitive (e.g. an intentionally public status page).

## Impact

- Cloud account compromise (metadata creds via SSRF), internal network read access, and network mapping.
- Theft of every backend credential Grafana/Prometheus/Alertmanager touches → lateral movement into DBs, Elasticsearch, cloud APIs.
- RCE on the Grafana host (CVE-2024-9264) and arbitrary file read (CVE-2021-43798).
- Kubernetes cluster recon → SA token / kubelet exposure → cluster compromise.
- Alert suppression for detection evasion; secret/PII exposure via logs & traces.

## Pro Tips

1. Always fingerprint the version first (`/api/health`, `/api/v1/status/buildinfo`) — it decides RCE vs read vs recon.
2. The exposed dashboard is never the finding; the pivot is. Chain to metadata creds, backend creds, or RCE before reporting.
3. Prometheus `<secret>` masking is incomplete — hunt usernames and **URL-embedded creds** in `/api/v1/status/config` and `remote_write`.
4. Grafana can query its own backends for you via the data source proxy — you don't need the plaintext password to exfil data.
5. `*_build_info` and `kube_node_info` metrics hand you exact component versions — turn them straight into CVE targets.
6. Pair with `ssrf`, `information_disclosure`, `kubernetes`, `aws`/`gcp`, and `authentication_jwt` skills; use `nuclei` templates (`grafana-*`, `prometheus-*`) for fast triage.
7. On k8s, an exposed Prometheus/KSM often reveals the whole cluster topology and image versions with zero auth — prioritize it as a recon multiplier.

## Summary

Grafana and Prometheus are pivot engines, not endpoints. Grafana holds plaintext-recoverable credentials for every backend, proxies arbitrary server-side requests by default (SSRF → cloud metadata), reads arbitrary files (CVE-2021-43798), and can hit RCE (CVE-2024-9264). Prometheus/Alertmanager expose internal inventory, versions, and scrape/receiver credentials with no auth. Treat any reachable observability service as a launch point into the internal network, cloud account, databases, and cluster — and prove the pivot.
