# vault-files Roadmap

> **Vision**: Build the most comprehensive, privacy-focused, open-source document management and conversion platform

This roadmap outlines the planned features and improvements for vault-files. Dates and features are subject to change based on community feedback and priorities.

---

## Current Status

**Version**: 0.1.0-alpha  
**Phase**: Foundation (Q2 2026)  
**Focus**: Core architecture and essential PDF operations

---

## Release Schedule

### Phase 1: Foundation — Q2 2026 (Current)

**Goal**: Establish robust core infrastructure and basic document processing capabilities

#### Completed ✅

- [x] Project structure and architecture design
- [x] Core document processing engine foundation
- [x] Repository infrastructure (contributing guidelines, issue templates)
- [x] Basic README and documentation structure
- [x] MIT License selection

#### In Progress 🚧

- [ ] **PDF Operations** (Target: Week 3, May 2026)
  - [ ] PDF merging with bookmark preservation
  - [ ] PDF splitting by page ranges
  - [ ] PDF compression with quality settings
  - [ ] Page extraction and reordering
  - [ ] Basic metadata editing

- [ ] **Initial Converters** (Target: Week 4, May 2026)
  - [ ] PDF to Markdown converter with formatting preservation
  - [ ] Markdown to PDF with styling options
  - [ ] DOCX to PDF conversion
  - [ ] PDF to DOCX with layout preservation

- [ ] **Web Interface Alpha** (Target: End of May 2026)
  - [ ] File upload and drag-and-drop
  - [ ] Basic conversion interface
  - [ ] Operation history
  - [ ] Download management

#### Planned (Q2 2026)

- [ ] **Testing Infrastructure**
  - [ ] Unit test framework setup
  - [ ] Integration tests for converters
  - [ ] Test coverage reporting
  - [ ] Format-specific test fixtures

- [ ] **Documentation**
  - [ ] API documentation
  - [ ] Conversion best practices guide
  - [ ] Architecture documentation
  - [ ] Developer setup guide

---

### Phase 2: Format Expansion — Q3 2026

**Goal**: Broaden format support and introduce advanced document manipulation features

#### Core Features

- [ ] **PowerPoint Support** (July 2026)
  - [ ] PPTX generation from templates
  - [ ] Markdown to PPTX conversion
  - [ ] Slide editing and manipulation
  - [ ] Theme customization
  - [ ] Export to PDF and HTML

- [ ] **Image Processing Pipeline** (July-August 2026)
  - [ ] Format conversion (JPG, PNG, WebP, HEIC, AVIF)
  - [ ] Batch image compression
  - [ ] Watermark application
  - [ ] Image extraction from documents
  - [ ] OCR integration for image-based PDFs

- [ ] **Spreadsheet Conversion** (August 2026)
  - [ ] XLSX to CSV/JSON/PDF
  - [ ] CSV to XLSX with formatting
  - [ ] Data validation preservation
  - [ ] Formula handling
  - [ ] Chart extraction

- [ ] **eBook Formats** (September 2026)
  - [ ] ePub generation and parsing
  - [ ] MOBI conversion
  - [ ] Table of contents generation
  - [ ] Metadata editing
  - [ ] Cover image handling

- [ ] **Archive Handling** (September 2026)
  - [ ] ZIP, RAR, 7Z extraction
  - [ ] Batch file processing from archives
  - [ ] Archive creation with compression options
  - [ ] Password protection support

#### Quality & Performance

- [ ] Memory optimization for large files (>100MB)
- [ ] Streaming support for massive documents
- [ ] Parallel processing for batch operations
- [ ] Progress tracking for long operations
- [ ] Error recovery and retry mechanisms

---

### Phase 3: Advanced Features — Q4 2026

**Goal**: Add collaborative features, integrations, and intelligent processing

#### Collaboration

- [ ] **Real-time Editing** (October 2026)
  - [ ] Collaborative document editing
  - [ ] Change tracking and version history
  - [ ] Comment and annotation system
  - [ ] User presence indicators
  - [ ] Conflict resolution

#### Cloud Integration

- [ ] **Storage Providers** (October-November 2026)
  - [ ] Google Drive integration
  - [ ] Dropbox integration
  - [ ] Microsoft OneDrive integration
  - [ ] Direct cloud file conversion
  - [ ] Sync and backup features

#### Mobile Experience

- [ ] **Mobile Applications** (November 2026)
  - [ ] iOS app with document scanner
  - [ ] Android app with conversion features
  - [ ] Mobile-optimized web interface
  - [ ] Offline mode support
  - [ ] Camera-based OCR

#### AI-Powered Features

- [ ] **Intelligent Processing** (November-December 2026)
  - [ ] Advanced OCR with multi-language support
  - [ ] Smart content extraction and summarization
  - [ ] Automatic format detection
  - [ ] Document classification
  - [ ] Quality assessment and optimization suggestions

#### Batch Processing Dashboard

- [ ] **Automation Tools** (December 2026)
  - [ ] Visual workflow builder
  - [ ] Scheduled batch operations
  - [ ] Template-based automation
  - [ ] Webhook triggers
  - [ ] Processing queue management

---

### Phase 4: Enterprise & Ecosystem — Q1 2027

**Goal**: Build a sustainable ecosystem with enterprise features and developer platform

#### Developer Platform

- [ ] **Public API** (January 2027)
  - [ ] RESTful API with comprehensive documentation
  - [ ] GraphQL endpoint
  - [ ] API key management
  - [ ] Rate limiting and quotas
  - [ ] Webhook notifications
  - [ ] SDK for popular languages (JavaScript, Python, Go)

#### Plugin Marketplace

- [ ] **Extension Ecosystem** (January-February 2027)
  - [ ] Plugin SDK and development tools
  - [ ] Plugin marketplace platform
  - [ ] Community plugin repository
  - [ ] Plugin rating and review system
  - [ ] Automatic plugin updates
  - [ ] Security scanning for plugins

#### Enterprise Edition

- [ ] **Self-Hosted Solution** (February-March 2027)
  - [ ] Docker deployment with orchestration
  - [ ] Multi-tenant architecture
  - [ ] Role-based access control (RBAC)
  - [ ] Audit logging
  - [ ] SSO integration (SAML, OAuth)
  - [ ] Enterprise support packages

#### Advanced Automation

- [ ] **Workflow Engine** (March 2027)
  - [ ] Visual workflow designer
  - [ ] Conditional logic and branching
  - [ ] Integration with external services (Zapier, Make, n8n)
  - [ ] Custom scripting support
  - [ ] Scheduled automation
  - [ ] Event-driven triggers

#### Team Collaboration

- [ ] **Team Features** (March 2027)
  - [ ] Team workspace management
  - [ ] Shared templates and styles
  - [ ] Collaboration analytics
  - [ ] Permission management
  - [ ] Team activity dashboard
  - [ ] Billing and usage tracking

---

## Long-term Vision (2027+)

### Advanced Capabilities

- **AI Document Understanding**
  - Natural language document queries
  - Semantic search across documents
  - Content generation and rewriting
  - Accessibility improvements

- **Advanced PDF Features**
  - PDF form creation and editing
  - Digital signature with certificate management
  - PDF/A compliance for archiving
  - PDF redaction with permanent removal

- **Specialized Formats**
  - CAD file preview and conversion
  - Medical imaging (DICOM)
  - Scientific data formats (HDF5, NetCDF)
  - 3D model conversions

- **Enterprise Security**
  - End-to-end encryption
  - Document rights management (DRM)
  - Compliance certifications (SOC 2, ISO 27001)
  - Advanced audit trails

### Platform Expansion

- **Desktop Applications**
  - Native Windows, macOS, Linux apps
  - System integration (right-click menu, drag-and-drop)
  - Offline-first architecture
  - Cross-device synchronization

- **Browser Extensions**
  - Quick conversion from browser
  - Web page to PDF with full styling
  - Screenshot annotation
  - Integration with web services

---

## Community Priorities

We track community-requested features through [GitHub Discussions](https://github.com/PtiCalin/vault-files/discussions) and issue voting. The following features are highly requested:

### Top Community Requests 🔥

1. **Dark Mode Interface** - Planned for Phase 2
2. **Batch Rename Tool** - Planned for Phase 2
3. **PDF Editing Tools** (annotations, highlights) - Planned for Phase 3
4. **Command Line Interface (CLI)** - Planned for Phase 2
5. **Custom Watermarks** - Planned for Phase 2

### Under Consideration 💭

- Video file conversion support
- Audio transcription and generation
- Blockchain-based document verification
- Federated/P2P document sharing
- AR/VR document viewing

Vote on features and suggest new ones in our [Feature Requests](https://github.com/PtiCalin/vault-files/discussions/categories/feature-requests) forum.

---

## Contributing to the Roadmap

The vault-files roadmap is shaped by community input. You can influence priorities by:

1. **Voting on issues** - React with 👍 on GitHub issues
2. **Participating in discussions** - Join conversations about features
3. **Submitting proposals** - Create detailed feature proposals
4. **Contributing code** - Implement features you want to see
5. **Sponsoring development** - Support specific features financially

---

## Release Philosophy

### Version Numbering

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking API changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

### Release Cadence

- **Major releases**: Annually
- **Minor releases**: Quarterly
- **Patch releases**: As needed for critical bugs
- **Security patches**: Immediate

### Support Policy

- **Current major version**: Full support
- **Previous major version**: Security patches for 6 months
- **Older versions**: Community support only

---

## Progress Tracking

Track our progress:

- **GitHub Projects**: [Project Board](https://github.com/PtiCalin/vault-files/projects)
- **Milestones**: [Release Milestones](https://github.com/PtiCalin/vault-files/milestones)
- **Changelog**: [CHANGE-LOG.md](.github/versionning/CHANGE-LOG.md)
- **Discussions**: [GitHub Discussions](https://github.com/PtiCalin/vault-files/discussions)

---

## Feedback

Have thoughts on the roadmap? We'd love to hear from you:

- **General feedback**: [Start a discussion](https://github.com/PtiCalin/vault-files/discussions/new?category=roadmap-feedback)
- **Feature requests**: [Submit a feature request](https://github.com/PtiCalin/vault-files/issues/new?template=feature_request.yml)
- **Questions**: [Ask in Q&A](https://github.com/PtiCalin/vault-files/discussions/new?category=q-a)

---

**Last Updated**: May 9, 2026  
**Next Review**: June 2026
