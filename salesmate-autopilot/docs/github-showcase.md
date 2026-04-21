# GitHub Showcase Guide

Use this page as a checklist before publishing the repository.

## Repository Positioning

SalesMate AutoPilot is not a generic chatbot. It is an agentic workflow demo for automotive retail sales.

One-sentence pitch:

> A sales consultant copilot that turns showroom conversations into customer profiles, competitor response cards, personalized reports, DMS archives, and follow-up strategies.

## Recommended Screenshots

Capture these pages after running the demo:

1. Dashboard with the product showcase and capability cards.
2. Reception cockpit after 3-5 dialogue lines.
3. Recommendation page after the customer mentions Highlander or after manually adding a potential competitor.
4. Departure report after clicking generate.
5. DMS archive page after syncing.

Save screenshots under:

```text
docs/screenshots/
```

Suggested filenames:

```text
01-dashboard.png
02-reception-cockpit.png
03-recommendation-competitor.png
04-departure-report.png
05-dms-archive.png
```

## Demo Recording Flow

For a 60-90 second screen recording:

1. Start on the dashboard.
2. Click `一键跑完整流程`.
3. Pause on the reception cockpit while the dialogue and AI cards update.
4. Let the flow land on the DMS follow-up page.
5. Scroll to the data storage strategy.

Narration:

"SalesMate AutoPilot embeds AI into the automotive sales workflow. It listens to showroom dialogue, updates customer intent, pushes low-interruption sales cards, generates a departure report, and writes the customer archive back to DMS while keeping data sovereignty with the dealer."

## README Badges To Add Later

Optional after publishing:

```text
Demo: local runnable
Stack: Vanilla JS + Node.js
Status: MVP
License: MIT
```

## Judges' Checklist

The repo should clearly prove:

- It can run locally.
- It has a visible frontend app.
- It has backend APIs.
- It has multi-agent coordination.
- It reserves DMS integration.
- It explains customer data storage boundaries.
- It provides a repeatable demo script.
