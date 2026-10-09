# Study Hub delivery requirements

The owner requires every new feature and user-visible change to appear as a test in the owner review cabinet before release.

- Add or update its scenario in `server/src/lib/reviewCatalog.ts`: purpose, relevant roles, concrete actions, expected results, and current limitations.
- Provide usable test data and permissions for the complete workflow. A catalog card alone is not sufficient when its actions cannot be performed.
- Use isolated fixtures for writes. Never use a real learner's attempts, marks, or feedback for acceptance testing. Starting a new review must allow a fresh attempt; resuming one must preserve its data.
- Keep feedback associated with the scenario, step, role, and deployed version through the existing review rail.
- For each release, update `review-release.json` with the scenario IDs and a short description. Run `npm run check:review -- --base <previous-production-commit>` in the release checkout after staging, and run relevant behavioral tests before publishing. CI checks the same contract.
- Do not report a release as verified merely because CI or a build passes. Verify the catalog card, role launch, actual workflow, persisted state, and feedback on the deployed version. Report any remaining verification boundary.

The root workspace may not be a Git checkout. Use the existing `.release-check` checkout for reviewed publishing; copy only explicit changed files, preserve unrelated work, and keep `.studyhub-local` private and untracked.
