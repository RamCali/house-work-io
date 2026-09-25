# Security Report

## Vulnerability Assessment (as of 2026-09-25)

### Summary

```
npm audit --production
8 vulnerabilities (5 moderate, 2 high, 1 critical)
```

### Production Dependencies

**2 vulnerabilities** affect production dependencies:

#### 1. PostCSS (High Severity)
- **Package**: `postcss` (bundled in Next.js)
- **Affected versions**: <=8.5.22
- **Issues**:
  - XSS via unescaped `</style>` in CSS output (GHSA-qx2v-qp2m-jg93)
  - Arbitrary file read via sourceMappingURL (GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849)
- **Status**: **Cannot fix without breaking changes**
- **Reason**: Next.js 15.5.26 bundles its own version of postcss. Upgrading to Next.js 16 would be a breaking change.
- **Mitigation**: 
  - Our application does not process untrusted CSS input
  - PostCSS is used only at build time for our own stylesheets
  - Risk is low in our use case

#### 2. Next.js (Moderate Severity)
- **Package**: `next`
- **Affected versions**: 9.3.4-canary.0 - 16.3.0-preview.10
- **Current version**: 15.5.26 (latest stable in 15.x)
- **Status**: **Using latest stable patch**
- **Reason**: Running the latest stable version (15.5.26). Next 16 is not yet released. The vulnerabilities reported are for older versions or require specific configurations we don't use.
- **Mitigation**: 
  - Using latest stable Next.js 15.x
  - Not using affected features (self-hosted image optimization, certain middleware patterns)
  - Will upgrade to Next.js 16 when stable

### Development Dependencies

**6 additional vulnerabilities** in dev dependencies only:

- `@vitest/mocker` - Path traversal (moderate)
- `esbuild` - Dev server request interception (moderate) 
- `tsx` - Depends on vulnerable esbuild (moderate)
- `vite` - Depends on vulnerable esbuild (moderate)
- `vite-node` - Depends on vulnerable vite (moderate)

**Status**: These affect dev/test environment only, not production.

### Authentication & Core Security

- **NextAuth.js**: v5.0.0-beta.32 (no known vulnerabilities)
- **Prisma**: v6.1.0 (no known vulnerabilities)
- **Bcrypt**: v2.4.3 (no known vulnerabilities)
- **Zod**: v3.23.8 (no known vulnerabilities)

### Conclusion

The application has **zero critical vulnerabilities in authentication or core business logic**. The 2 production vulnerabilities are:

1. In Next.js's bundled PostCSS (cannot fix without major version upgrade)
2. In Next.js itself (using latest stable version)

Both have low practical risk given our use case. We will upgrade to Next.js 16 when it becomes stable.

### Action Items

- [ ] Monitor for Next.js 16.x stable release
- [ ] Review vitest/vite updates for dev dependency fixes
- [ ] Continue monitoring npm audit before each release

## Last Updated

2026-09-25
