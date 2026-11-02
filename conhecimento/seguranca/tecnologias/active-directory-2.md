<!-- Adaptado de usestrix/strix/strix/skills/technologies/active_directory.md @6b7ae2e, © 2025 OmniSecure Inc., Apache-2.0. Alterações: tirados o cabeçalho, o jinja e os comandos da ferramenta, dividido em partes, mantido em inglês; alterado por agentes-ultimate. Licença em terceiros/usestrix-strix/. -->
<!-- ref: tema=seg-tecnologias-active-directory-2; palavras=active directory parte 2, seguranca do ad parte 2; agentes=auditor-seguranca, engenheiro-software -->
<!-- teste-ref: sim=leia active directory parte 2 do guia | leia seguranca do ad parte 2 do guia; nao=faça o fechamento do orçamento de viagens -->
## Pro Tips

1. BloodHound before brute force — the graph turns hours of guessing into a named path; always mark owned nodes.
2. Prefer AS-REP roasting and `certipy find` early — both are quiet and one needs no creds.
3. Shadow Credentials > password reset when you have write access: reversible, doesn't lock out the account, no plaintext needed.
4. Fix clock skew before Kerberos work: `sudo ntpdate <DC>` (or `faketime`) — `KRB_AP_ERR_SKEW` kills ticket ops.
5. Use FQDNs and set `/etc/resolv.conf` to the DC (or `--dns-server`); Kerberos and LDAP referrals break on bare IPs.
6. `nxc` (NetExec) is the CrackMapExec successor — CME is unmaintained; use `nxc` and its `--gen-relay-list`, `--bloodhound`, `-M` modules.
7. Pair with `nmap` (service/port discovery) and `authentication_jwt` skills where the domain fronts web SSO (ADFS/SAML).

## Tooling

**None of the AD tools below ship in the sandbox by default** (the image is Kali-rolling but installs only web-focused tooling). Install what the task needs — the sandbox has `pipx`, `pip`, `go`, `git`, and Kali's apt repos. AD testing also requires **network reachability to the target DC/subnet**, which the default web-target sandbox usually lacks; confirm connectivity first.

```
# Python identity toolkit (impacket = GetUserSPNs/GetNPUsers/secretsdump/ntlmrelayx/getST/addcomputer/rbcd)
pipx install impacket
pipx install netexec            # nxc — CME successor: ldap/smb/winrm enum, roasting, bloodhound, ntds
pipx install certipy-ad         # AD CS enum + ESC1-ESC17 abuse, shadow credentials
pipx install bloodhound-ce      # bloodhound-ce-python collector (BloodHound CE ingestor)
pipx install coercer            # multi-protocol coercion (MS-EFSR/RPRN/DFSNM/FSRVP)
pipx install bloodyAD           # DACL / LDAP object edits over LDAP
pipx install ldapdomaindump     # LDAP dumper (bloodhound.py author)
go install github.com/ropnop/kerbrute@latest   # kerbrute (Go) — user enum / pre-auth brute

# Kali apt packages
sudo apt-get install -y smbclient ldap-utils krb5-user enum4linux-ng responder hashcat john
```

- **NetExec (`nxc`)** — swiss-army enum/exec across smb/ldap/winrm/mssql; use for creds validation, share hunting, `--kerberoasting`, `--bloodhound`, `--ntds`.
- **impacket** — the canonical scriptable attack primitives (roasting, S4U, relay, secretsdump, ticket forging).
- **Certipy** — AD CS: `find -vulnerable`, `req`, `auth`, `shadow`, relay; covers the full ESC1-ESC17 set.
- **BloodHound CE + collector** — attack-path graphing; the first thing to run with any valid credential.
- **Responder / ntlmrelayx / Coercer / PetitPotam** — the poisoning→coercion→relay chain (needs L2 access or a coercible target).
- **hashcat / john** — offline cracking of roasted `$krb5tgs$`/`$krb5asrep$` blobs (modes `13100` / `18200`).

Humans often use GUI BloodHound and Windows-side C# tooling (SharpHound, Rubeus, Certify, PowerView); in-sandbox prefer the Python/Linux equivalents above (`bloodhound-ce-python`, impacket, Certipy, `nxc`).

## Summary

AD compromise is a graph problem: start from a valid credential, map paths with BloodHound, and chain misconfigurations — roastable accounts, delegation flags, vulnerable certificate templates, coercion+relay, and permissive DACLs — until you reach DCSync or a forged ticket. The identity plane (Kerberos/LDAP/NTLM/SMB/AD CS), not the perimeter, is where domains fall.
