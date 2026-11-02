<!-- Adaptado de usestrix/strix/strix/skills/cloud/azure.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-nuvem-azure-2; palavras=seguranca azure parte 2, azure ad parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia seguranca azure parte 2 do guia | leia azure ad parte 2 do guia; nao=escreva o texto da campanha de natal -->
## Key Vault, Secrets, and Certificates

- Determine whether the vault uses Azure RBAC or legacy access policies. The active model is controlled by `enableRbacAuthorization`; RBAC mode invalidates access-policy evaluation for data-plane access.
- Enumerate who can read secrets, keys, and certificates; who can change access; and who controls workloads with vault-reading identities.
- Review public network access, firewall/private endpoints, soft delete, purge protection, logging, secret expiry, and rotation.
- Distinguish key operations (sign/decrypt/wrap) from key export and secret-value read.
- Look for vault references copied into app settings without corresponding identity isolation.
- Test backup/restore and cross-subscription permissions where in scope.

Legacy access-policy write authority on the vault resource can still become self-granting in access-policy mode. In RBAC mode, the equivalent finding depends on `DataActions` or role-assignment control, not on legacy access-policy mutation.

## Credential-Equivalent Actions

Treat the following as credential-equivalent or near-equivalent authority when the downstream scope matches:

| Surface | Action or state | Why it matters |
|---|---|---|
| Azure RBAC | `Microsoft.Authorization/roleAssignments/write` | grants new authority directly |
| Root scope | `Microsoft.Authorization/elevateAccess/action` | bridges Entra Global Administrator into Azure root access |
| Managed identity | host config write plus `.../userAssignedIdentities/assign/action` | attaches a stronger identity to attacker-controlled code |
| App object | add secret/cert/federated credential or owner | permits application impersonation |
| Service principal | add credential/owner or modify federation | permits enterprise-app impersonation |
| Storage | `listKeys` or account-key disclosure | enables service/account SAS and broad account access |
| Storage | `generateUserDelegationKey` with matching data rights | enables user delegation SAS issuance |
| Key Vault | secret-value read, key sign/decrypt/wrap, or self-grant path | grants equivalent access even without export |

## Compute, Network, and Data Services

- VM extensions, Run Command, serial console, disks/snapshots, images, custom script, and boot diagnostics
- App Service/Functions deployment slots, publishing credentials, SCM/Kudu, app settings, storage mounts, and managed identities
- AKS control plane/RBAC, workload identity federation, kubeconfig retrieval, node/resource-group rights, and private API reachability
- Container Apps/ACI environment variables, registries, identities, revisions, and exec surfaces
- Automation accounts/runbooks, Logic Apps/connectors, Data Factory linked services, deployment scripts, and DevOps/service connections
- NSGs, route tables, public IPs, load balancers, private endpoints, DNS, peering, Bastion, firewalls, and JIT VM access
- SQL, Cosmos DB, Storage, Service Bus, Event Hubs, and other service-specific data-plane authorization

Map whether a principal that lacks direct data access can reconfigure networking, identity, code, diagnostics, export, backup, or deployment to gain an equivalent capability.

## Testing Methodology

1. **Establish context** — tenant, subscription, cloud, principal, token audience, and active PIM state.
2. **Inventory both role planes** — Entra directory roles and Azure resource roles with groups, scope, inheritance, conditions, eligible/active state, and custom definitions.
3. **Map identity objects** — applications, service principals, managed identities, owners, credentials, federation, and consent.
4. **Review policy gates** — Conditional Access, authentication methods, PIM settings, Azure Policy, deny assignments, and network restrictions.
5. **Enumerate workloads/data** — identify where control-plane modification yields code execution, identity use, secrets, backups, or data-plane access.
6. **Build effective-access paths** — principal → permission → resource change/identity → downstream privilege or data.
7. **Cross-check logs** — Entra sign-in/audit, PIM, Azure Activity, resource logs, and Defender/Sentinel alerts where available.
8. **Re-evaluate boundaries** — guest/home tenant, management-group inheritance, test/production, group ownership, and workload identities.

## Validation

For each finding, include:

1. tenant/subscription and exact principal/object IDs
2. assignment source, role definition, scope, inheritance, condition, and PIM state
3. relevant Conditional Access/authentication result
4. exact Azure/Graph action and target resource
5. effective permission or cross-plane path demonstrated
6. policy, deny, network, licensing, or configuration prerequisites
7. audit/sign-in/activity evidence and remediation at the correct control plane

## Common False Positives

- Role name appears privileged but custom `Actions`/`DataActions`, conditions, scope, or deny assignments block the claimed action.
- Contributor is reported as able to assign roles without `roleAssignments/write` or an alternate workload/identity path.
- An eligible PIM assignment is described as standing active access.
- A Conditional Access policy exists but is report-only, excluded, or does not apply to the tested principal/application.
- An app registration is confused with its service principal in another tenant.
- A managed identity is present but the tester cannot control its host or obtain a token in the relevant context.
- An expired/revoked SAS or credential metadata is reported as usable access.
- ARM access is assumed to grant service data-plane access automatically.

## Tooling

### Azure CLI and Microsoft Graph

Use the official Azure CLI for resource context and `az rest` for reviewed ARM/Graph queries not exposed cleanly by a command group. Record CLI/API versions and requested permissions. Broad directory inventory often requires Microsoft Graph application permissions and admin consent; absence of results under a weak token is not proof that objects do not exist.

### Prowler (Conditional)

[Prowler](https://github.com/prowler-cloud/prowler) provides maintained Azure configuration/compliance checks. Install a reviewed pinned release in an isolated environment:

```bash
python -m pip install 'prowler==<reviewed-version>'
prowler azure --az-cli-auth --subscription-ids <subscription-id>
```

Other documented modes include service-principal, browser, and managed-identity authentication. Use a dedicated read-only audit principal with only the documented tenant/subscription permissions. Scope subscription IDs explicitly, protect reports as sensitive asset/identity inventories, account for API volume/throttling, and do not enable cloud upload for assessment data unless approved. Prowler findings are configuration leads; trace effective principal/action/resource paths before treating them as exploitable.

## Summary

Azure security is an identity-and-scope graph across Entra and ARM. Test directory roles, Azure RBAC, PIM, Conditional Access, service principals, managed identities, delegated storage access, workload control, and service data planes as one system while preserving the distinction between each control plane.
