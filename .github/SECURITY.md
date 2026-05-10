# Security Policy

## Supported Versions

The following versions of vault-files are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

The vault-files team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities through one of the following methods:

#### Option 1: GitHub Security Advisories (Preferred)

1. Go to the [Security Advisories](https://github.com/PtiCalin/vault-files/security/advisories) page
2. Click "Report a vulnerability"
3. Fill out the advisory form with details

#### Option 2: Email

Send an email to: **security@vault-files.dev** (or create a private contact method)

Include the following information:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Initial Response**: Within 48 hours, we will acknowledge receipt of your vulnerability report
- **Status Updates**: We will send regular updates about our progress (at least every 5 business days)
- **Disclosure Timeline**: We aim to disclose vulnerabilities within 90 days of the initial report
- **Credit**: With your permission, we will publicly acknowledge your responsible disclosure

### Security Assessment Timeline

1. **Report Received** → Acknowledge within 48 hours
2. **Initial Triage** → Assess severity within 5 business days
3. **Investigation** → Confirm vulnerability and determine scope
4. **Fix Development** → Create and test security patch
5. **Release** → Deploy fix to supported versions
6. **Public Disclosure** → Publish security advisory with credit

### Severity Classification

We use the following severity levels:

- **Critical**: Allows remote code execution or complete system compromise
- **High**: Allows unauthorized access to sensitive data or significant privilege escalation
- **Medium**: Allows unauthorized actions with limited scope or requires user interaction
- **Low**: Minor security concerns with limited impact

### Scope

The following are **IN SCOPE** for security reports:

- Remote code execution vulnerabilities
- Authentication and authorization bypasses
- SQL injection, command injection, and other injection vulnerabilities
- Cross-site scripting (XSS) in web interfaces
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Path traversal and arbitrary file access
- Insecure deserialization
- XML external entity (XXE) injection
- Cryptographic vulnerabilities
- Information disclosure (API keys, credentials, sensitive data)
- Denial of service (with proof of significant impact)
- Dependencies with known security vulnerabilities (CVEs)

The following are **OUT OF SCOPE**:

- Social engineering attacks
- Physical attacks
- Denial of service requiring excessive resources
- Issues in third-party libraries (report to the library maintainers)
- Vulnerabilities requiring compromised credentials
- Clickjacking on non-sensitive pages
- Missing security headers without proof of exploitability
- Self-XSS
- Rate limiting issues without proof of significant impact
- Reports from automated tools without verification

## Security Best Practices

When using vault-files, we recommend:

### For Users

1. **Keep Software Updated**: Always use the latest version with security patches
2. **Validate Input Files**: Only process documents from trusted sources
3. **Secure File Storage**: Store sensitive documents with appropriate encryption
4. **Review Permissions**: Grant minimal necessary permissions when using plugins
5. **Monitor Activity**: Review logs for suspicious conversion patterns
6. **Use HTTPS**: When deploying web interfaces, always use HTTPS
7. **Environment Variables**: Never hardcode API keys or credentials

### For Developers

1. **Input Validation**: Validate all user inputs and file uploads
2. **Output Encoding**: Properly encode outputs to prevent injection attacks
3. **Authentication**: Implement proper authentication for API endpoints
4. **Authorization**: Verify user permissions for all operations
5. **Secure Dependencies**: Regularly audit and update dependencies
6. **Code Review**: Require security review for PRs touching sensitive code
7. **Secret Management**: Use environment variables or secret managers
8. **Logging**: Log security-relevant events without exposing sensitive data

### For Self-Hosted Deployments

1. **Network Security**: Deploy behind a firewall with minimal exposed ports
2. **Access Control**: Implement role-based access control (RBAC)
3. **TLS/SSL**: Use valid certificates for all connections
4. **Regular Updates**: Apply security patches promptly
5. **Backup Strategy**: Maintain secure, encrypted backups
6. **Monitoring**: Implement security monitoring and alerting
7. **Incident Response**: Have a documented incident response plan

## Known Security Considerations

### Document Processing

- **Malicious PDFs**: vault-files processes untrusted documents. Always run with appropriate sandboxing
- **File Size Limits**: Configure appropriate file size limits to prevent resource exhaustion
- **Format Validation**: All document formats are validated before processing

### Plugin System

- **Plugin Verification**: Only install plugins from trusted sources
- **Sandboxing**: Plugins run with limited permissions by default
- **Code Review**: Review plugin source code before installation when possible

### Data Privacy

- **Local Processing**: By default, all processing happens locally
- **No Data Collection**: vault-files does not send telemetry or usage data
- **File Cleanup**: Temporary files are securely deleted after processing

## Security Updates

Security updates will be announced through:

1. [GitHub Security Advisories](https://github.com/PtiCalin/vault-files/security/advisories)
2. [Release Notes](https://github.com/PtiCalin/vault-files/releases)
3. [Changelog](.github/versionning/CHANGE-LOG.md)

Subscribe to repository notifications to stay informed about security updates.

## Past Security Advisories

No security advisories have been published yet.

## Contact

For security-related questions that are not vulnerability reports, please open a discussion in [GitHub Discussions](https://github.com/PtiCalin/vault-files/discussions).

---

**Last Updated**: May 2026
