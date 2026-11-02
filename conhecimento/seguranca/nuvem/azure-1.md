<!-- Adaptado de usestrix/strix/strix/skills/cloud/azure.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-nuvem-azure-1; palavras=seguranca azure, azure ad, seguranca azure no codigo; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=audite o sistema quanto a seguranca azure | o código pode ter azure ad, confira; nao=faça o fechamento do orçamento de viagens -->
# Azure and Microsoft Entra Security

Azure security spans two related but distinct control planes:

- **Microsoft Entra ID** (formerly Azure AD): tenant identity, users, groups, applications, service principals, directory roles, authentication, and Conditional Access.
- **Azure Resource Manager (ARM):** management groups, subscriptions, resource groups, resources, Azure RBAC, managed identities, and service-specific control/data planes.

Do not equate an Entra directory role with an Azure resource role. A principal can be weak in one plane and privileged in the other, and many escalation paths cross between them.

## Scope and Identity Baseline

Record before testing:

- tenant ID, cloud environment, management groups, subscriptions, and directories in scope
- current user/service principal/managed identity object ID and home tenant
- direct and group-derived Entra directory roles
- Azure role assignments, scope, inheritance, conditions, and deny assignments
- authentication method, token audience, Conditional Access result, and PIM activation state
- test versus production subscriptions and any cross-tenant/B2B context

Start with native CLI context:

```bash
az cloud show --output json
az account show --output json
az account list --all --refresh --output json
az account management-group list --no-register --output json
az ad signed-in-user show --output json
az role assignment list --subscription <subscription-id> --all --include-inherited --output json
az role assignment list --subscription <subscription-id> --assignee <user-object-id> --all --include-inherited --include-groups --output json
az role definition list --subscription <subscription-id> --output json
```

For a service principal, `az ad signed-in-user show` does not apply; resolve the current client/service-principal object explicitly from the reviewed credential context. `--all` remains scoped to the selected subscription, and `--include-groups` depends on Microsoft Graph and can still miss nested or workload-derived paths. Repeat the inventory per tenant, management-group root, and in-scope subscription. Never infer identity only from a display name.

## Azure RBAC

An Azure role assignment joins three elements: a security principal, a role definition, and a scope. Scope inheritance runs from management group to subscription to resource group to resource.

### Review

- Enumerate direct, group-derived, inherited, eligible, and active assignments separately.
- Expand custom role `Actions`, `NotActions`, `DataActions`, and `NotDataActions`; the role name is not a reliable summary.
- Inspect assignment conditions/ABAC, deny assignments, management-group inheritance, and cross-tenant principals.
- Identify broad scopes for Owner, Contributor, User Access Administrator, Role Based Access Control Administrator, and custom equivalents.
- Check who can write role assignments, role definitions, policies, locks, deployments, managed identities, credentials, or compute configuration.
- Distinguish ARM control-plane permission from service data-plane permission. Contributor over a resource may still gain its data through code/configuration or a managed identity even without direct data actions.

### High-Value Cross-Plane Paths

- Active Microsoft Entra Global Administrator can elevate into Azure by using `Microsoft.Authorization/elevateAccess/action` to grant User Access Administrator at the root `/` scope. That root assignment can persist after PIM deactivation until it is explicitly removed.
- `Microsoft.Authorization/roleAssignments/write` or equivalent role-management authority → grant a stronger role at an allowed scope.
- Ability to modify a VM, VM extension, Function App, App Service, Container App, Automation runbook, deployment script, Logic App, or similar workload → execute in that workload's identity and network context.
- Ability to attach or replace a user-assigned managed identity, together with the host resource write path and `Microsoft.ManagedIdentity/userAssignedIdentities/assign/action` → inherit its downstream Azure permissions.
- Ability to modify federated identity credentials, app credentials, certificates, or owners → impersonate a service principal/application.
- Ability to read deployment outputs, app settings, runbook variables, storage, snapshots, disks, backups, or diagnostic settings → recover credentials or sensitive data.
- Broad policy/deployment rights at a parent scope → affect many child resources even when individual resource assignments appear narrow.

Model each path using exact principal, action, resource, scope, condition, and resulting effective permission. Check Azure Policy and deny assignments before declaring a theoretical path exploitable.

## Privileged Identity Management (PIM)

[Microsoft Entra Privileged Identity Management](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure) provides time-based and approval-based activation for privileged access. It can govern Microsoft Entra roles, Azure resource roles, and PIM for Groups.

PIM terminology:

- **eligible:** the principal must activate before using the role
- **active:** the principal can use the role without activation
- **permanent/time-bound:** duration of eligibility or assignment
- **activated:** a currently active, time-limited instance created from eligibility

### What to Test

- Permanent active assignments where eligible/JIT access is expected.
- Permanent eligibility without access reviews, expiration, or a business need.
- Roles that activate without MFA, approval, justification, notification, or a short duration.
- Approvers who can approve themselves indirectly, lack separation of duties, or no longer own the system.
- Group-based eligibility where group ownership/membership can be changed by a lower-privileged principal.
- PIM for Groups on role-bearing groups where a lower-privileged principal can alter ownership, membership, or activation controls.
- PIM settings applied to one privileged role but omitted from a custom/equivalent role.
- Directory-role PIM configured while equivalent Azure resource roles remain permanently active, or vice versa.
- Standing service-principal/workload access. Eligible Azure RBAC via PIM is a user-centric control; service principals and managed identities remain standing or time-bounded active assignments, not user-style eligible activations.
- Activation sessions that remain useful through cached tokens, active sessions, delegated jobs, or downstream credentials after the intended window.
- Audit/alert coverage for assignment, activation, approval, renewal, extension, and role-setting changes.

With sufficient Microsoft Graph read permissions, compare current schedule instances:

```bash
az rest --method GET \
  --url 'https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilityScheduleInstances?$expand=principal,roleDefinition'

az rest --method GET \
  --url 'https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleInstances?$expand=principal,roleDefinition'
```

Those endpoints cover Microsoft Entra role schedules. Follow `@odata.nextLink`, and record the exact Graph permissions or delegated role used because weak tokens silently under-enumerate. Azure resource-role PIM is exposed through ARM's `Microsoft.Authorization` role eligibility/assignment schedule resources; keep the two inventories separate:

```bash
az rest --method GET \
  --url "https://management.azure.com/subscriptions/<subscription-id>/providers/Microsoft.Authorization/roleEligibilityScheduleInstances?api-version=2020-10-01&\$filter=atScope()"

az rest --method GET \
  --url "https://management.azure.com/subscriptions/<subscription-id>/providers/Microsoft.Authorization/roleAssignmentScheduleInstances?api-version=2020-10-01&\$filter=atScope()"
```

Follow `nextLink` there as well. For Entra directory-role inventory, reviewed readers commonly need `RoleEligibilitySchedule.Read.Directory` and `RoleAssignmentSchedule.Read.Directory` or an equivalent delegated role/application permission set.

## Conditional Access and Authentication

[Conditional Access](https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview) is Entra's identity-driven policy engine and is evaluated after first-factor authentication.

Review:

- policies in on/off/report-only state and coverage of users, groups, roles, applications, authentication contexts, and workload identities
- exclusions for break-glass accounts, admins, service accounts, guest users, locations, devices, or applications
- admin and management surfaces not covered by phishing-resistant MFA or appropriate authentication strength
- legacy authentication and non-interactive flows that do not receive the intended policy
- device compliance/join trust, named locations, sign-in/user risk, session lifetime, continuous access evaluation, and token protection where used
- policy gaps caused by nested groups, guest/home tenant behavior, service principals, managed identities, or application-specific grant paths
- whether emergency access exclusions are narrowly scoped, monitored, credential-protected, and exercised

For workload identities, Conditional Access applies only in limited cases: directly targeted tenant-owned single-tenant service principals can be controlled, but managed identities, Microsoft-owned service principals, most third-party SaaS service principals, and multitenant app registrations do not inherit human MFA semantics. Target the enterprise application service-principal object, not just the app registration, and verify the control at token issuance.

Use sign-in logs and the Conditional Access result to distinguish policy non-application from policy failure. Report-only evaluation is evidence of intended future control, not enforcement.

## Applications, Service Principals, and Workload Identity

An app registration is the tenant-level application definition; a service principal is the local security principal representing an application instance in a tenant.

Inventory:

- owners of application and service-principal objects, separately
- delegated versus application permissions and admin consent
- client secrets/certificates, expiry, unused/stale credentials, and credential-add rights
- federated identity credentials: issuer, subject, audience, repository/branch/environment claims
- multitenant applications, publisher verification, consent grants, and cross-tenant access settings
- service-principal role assignments in both Entra and Azure
- automation/CI connections and whether test identities can reach production

Keep application-object authority separate from service-principal authority. Application ownership and `Application.ReadWrite.*` can add owners, client secrets, certificates, or federated credentials on the app object; service-principal ownership and `ServicePrincipal.ReadWrite.*` govern the enterprise application instance. Admin consent is a separate control plane from credential management. Also trace group ownership/membership where a role-bearing group grants app, vault, Azure RBAC, or Entra role access. A secret's metadata proves age/expiry but not that its value is retrievable.

### Managed Identities

Managed identities remove stored credentials but still carry authority:

- **system-assigned:** lifecycle is tied to one Azure resource
- **user-assigned:** independent resource assignable to multiple workloads

Enumerate identity attachments and downstream role assignments. Check who can attach/detach the identity, execute or deploy code in the host workload, access its metadata/token endpoint, or reuse a user-assigned identity across environments. Treat workload control as potential identity control.

## Storage and SAS

A Shared Access Signature (SAS) delegates access to Azure Storage through a signed URI. Review:

- SAS type: user delegation, service, or account SAS
- services/resource types, permissions, start/expiry, protocol, IP restriction, and stored access policy
- long-lived tokens in source, CI logs, tickets, browser history, application settings, or public URLs
- account-key use, `listKeys` authority, and key-rotation feasibility
- public container/blob access, anonymous listing, network rules, private endpoints, and trusted-service exceptions
- storage RBAC and whether principals can generate user-delegation keys or list account keys

Microsoft recommends a user delegation SAS where supported because it is secured with Entra credentials rather than the account key. User delegation keys and SAS values are time-limited and user-scoped; service/account SAS values derive from account keys, and only service SAS can bind to stored access policies. User delegation SAS is limited to Blob/Data Lake and has a maximum seven-day validity per delegation key. A SAS is a bearer credential; possession can be sufficient even when the holder has no visible Azure role assignment.

Validate each token against its signed permission/resource/time restrictions. Do not treat a redacted or expired SAS found in code as current unauthorized access.
