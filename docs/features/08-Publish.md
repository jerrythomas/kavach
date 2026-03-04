# Publish

Publishing delivers the Learn site and documentation to the public, ensuring visitors experience validated content proven in the Verification suite. Every release references the verification report, pushes refreshed marketing assets, and keeps demo environments aligned across supported authentication platforms.

## Features

### Publication Gate

All releases must acknowledge the latest verification results before deployment.

```gherkin
Feature: Publication Gate

  Scenario: Release awaits verification sign-off
    Given a publish candidate is ready
    When the verification report from 07-Verification.md is attached to the release checklist
    Then the publishing pipeline becomes eligible to run
    And the release status reflects the verification timestamp
```

### About Page Publishing

The public Learn site highlights Kavach’s mission, capabilities, and value.

```gherkin
Feature: About Page Publishing

  Scenario: Visitor reads the About page after a publish
    Given the Learn site deployment completes
    When a visitor loads /about
    Then the page presents the current product vision, supported platforms, and links to quick starts
    And the publish metadata in the footer shows the release version and date
```

### Usage Documentation Hub

Usage documentation is bundled so visitors can explore how to integrate Kavach immediately.

```gherkin
Feature: Usage Documentation Hub

  Scenario: Publish updates documentation navigation
    Given new documentation markdown is merged
    When the publish task runs
    Then the docs index is rebuilt with updated guides and tutorials
    And the navigation search points to the latest content tree
```

### llms Manifest Publication

An llms.txt-style manifest is regenerated for AI-friendly documentation discovery.

```gherkin
Feature: llms Manifest Publication

  Scenario: Publish refreshes llms manifest
    Given the documentation corpus changes
    When the publish pipeline completes
    Then a new llms.txt manifest is generated at the site root
    And the manifest references every public documentation URL with 200 status verification
```

### Multi-Platform Demo Gallery

Platform demos (Supabase, Firebase, Auth0, Amplify, Convex) are redeployed with environment metadata.

```gherkin
Feature: Multi-Platform Demo Gallery

  Scenario: Publish updates demo gallery links
    Given platform-specific demos have new builds
    When the Learn site is published
    Then the demo gallery lists each supported platform with a working deep link
    And environment badges show the platform name, last verification run, and build commit
```

### Verification Stats Display

Verification results from the latest test run are surfaced on the public site so visitors can see freshness and platform coverage.

```gherkin
Feature: Verification Stats Display

  Scenario: Publish updates verification stats banner
    Given the verification suite outputs the latest run metadata
    When the publish pipeline posts the Learn site content
    Then the public status banner shows the “Last tested” timestamp and verification status
    And SDK and adapter versions used in the run are listed with their commit hashes

  Scenario: Publish embeds SDK version table
    Given the verification suite records library and adapter versions
    When the publish pipeline deploys the verification widget
    Then the widget lists each library and version used in the latest tests
    And a “Previous runs” dropdown links to archived verification reports
```

### Content Deployment Pipeline

Marketing content, documentation, and demo assets are deployed atomically.

```gherkin
Feature: Content Deployment Pipeline

  Scenario: Atomic publish transaction
    Given static assets, documentation, and demos are packaged
    When the pipeline deploys to production
    Then all assets are uploaded in a single release window
    And rollback metadata is stored for automatic recovery
```

### Post-Publish Confirmation

After deployment, automated checks validate that the public site serves the expected build.

```gherkin
Feature: Post-Publish Confirmation

  Scenario: Publish verifies live environment
    Given the deployment has finished
    When post-publish probes test critical pages, documentation endpoints, and demos
    Then the probes confirm build hashes match the release artifact
    And any failure automatically opens a follow-up task with rollback instructions
```
