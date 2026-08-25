// Canonical type definitions live in the `@fintech/shared` workspace package
// (shared/src/types.ts) so client and server can never drift apart. This file
// re-exports them under `server/src/types` purely so server code can keep
// importing from a local, conventional path.
export * from '@fintech/shared';
