# Product readiness

The prototype becomes a production surface through observable, testable user journeys—not by adding more panels.

## Journey contract

Each journey records its entry point, actor, authority, operation, optimistic state, success result, error result, audit event and recovery path. Humans and agents invoke the same typed operation; the actor changes, not the operation shape.

1. Enter Company and understand overall state.
2. Select a domain and inspect the records behind its state.
3. Switch between spatial and practical projections without changing records.
4. Open Command Centre with the trigger or Command/Ctrl+K.
5. Search pages, investigations and governance actions.
6. Navigate to a result and restore focus when cancelling.
7. Review a decision and its evidence.
8. Approve, decline or request a change within authority.
9. Inspect a workflow from trigger through verified outcome.
10. Follow a live execution and identify every human and agent actor.
11. Inspect knowledge, policy and evidence attached to work.
12. Detect stale, offline, unavailable and permission-denied states.
13. Recover from a failed read without duplicating an operation.
14. Observe an operation in structured logs and the audit trail.
15. Add or deactivate a company function through a governed operation.
16. See function changes reflected consistently across all surfaces.
17. Use the shell at desktop, compact and mobile breakpoints.
18. Complete core navigation and Command Centre journeys by keyboard and assistive technology.

## Quality gates

- `npm run check`: types, lint, tokens, generated assets and record contracts.
- `npm run test:e2e`: journeys at desktop, compact and mobile sizes.
- `npm run test:visual`: stable viewport screenshots.
- `npm run storybook`: isolated components and complete visual states.
- `npm run chromatic`: hosted component regression review when `CHROMATIC_PROJECT_TOKEN` is available in CI.
- Errors use stable event names and non-sensitive identifiers. Never log record payloads, credentials or customer data.
- User-visible releases update `CHANGELOG.md`; schema/topology changes also update the owning product contract and decisions log.
