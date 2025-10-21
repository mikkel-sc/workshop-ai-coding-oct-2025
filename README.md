# workshop-ai-coding-oct-2025

This is a demo app for "ProtectionSociety", a fictional Checklist app that is very successful, but has a legacy codebase that AI coding assistants often struggle to deal with.

In this workshop we aim to:

- Demonstrate how to best use Planning mode
- How to effectively manage your context
- What can we do with Claude skills

## Getting started

```bash
npm install && npm start
```

You should now be up and running

## Context

### Example 1: Bug in analytics page

There is a bug in the analytics page ("/analytics") where we are not showing the cleanliness score - first we are going to try and fix it with this prompt:

```text
There is a bug whereby we are not showing the cleanliness score in the @AnalyticsPage, please fix.
```

Run this in claude as-is, and make sure to use the "haiku" model (do "/model" and choose the "haiku" option) - this is so we can consistently demonstrate how context is important.

Once the fix is done, you'll see that the AI has added the missing column in the Results table, yay!

Now undo the changes we just made - because there's a problem. The analytics page is using a fetch call, but our standard is to use `TanstackQuery` - this is legacy code and must be fixed!

```Typescript
const response = await fetch(`${API_URL}/checklist`);
```

^ This is NOT what we want!

Next we are going to allow the AI to read the documentation on how we like to do things around here, and make sure this is in our context.

Keep using the haiku model, and clear your context like so:

```text
/clear
```

This will remove any context the model may have had, and then put this new prompt:

```text
There is a bug whereby we are not showing the cleanliness score in the @AnalyticsPage, please fix. @docs/frontend-best-practice.md
```

You'll notice that we are referencing the best practice documentation now, and that the result is quite different!

## Claude skills
