# Template access

## Product configuration

Base components, blocks and charts are free. Templates carry the Pro label.
Template contributions include $0, $1, $5, $10, $15 and custom amounts, with $1
suggested. Payment does not change which current templates a license includes.

`config/distribution.json` defines the CLI package name, release tag and source
directory. `config/product.ts` exposes the distribution and template settings to
the installation interface.

## Installation interface

The template installation interface presents license activation with
`login YOUR_LICENSE_KEY`, installation with `add template-<slug>` and the
component import. Free components use `add <slug>` without license activation.

`Installation` composes CodeBlock, Badge and Button. `PricingDialog`,
`PricingTable` and `ContributionPicker` provide the template access interface.

## Availability

Registration, license activation, contributions and template installation are
not connected to backend services in this local release. Their interface shows
the unavailable state. The CLI package is not published; free components can be
installed using the local package described in `docs/local-release.md`.
