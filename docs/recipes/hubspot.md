# Anakin + HubSpot — enrich a new Contact/Company from their website

Already called out as a "more ideas" use case in the live Zapier docs
("Lead enrichment — Scrape company websites from a CRM trigger") and HubSpot
CRM is listed among Make's popular Anakin connections — this turns that idea
into an actual buildable template instead of a bullet point.

## Zapier

1. **Trigger:** HubSpot — New Contact (or New Company)
2. **Action:** Anakin — Extract Website Data. `url`: the contact's/company's
   website field.
3. **Action:** HubSpot — Update Company (or Contact) — write
   `generatedJson` fields (e.g. company description, detected industry
   signals extracted via the scrape) into custom HubSpot properties.

## Make

```
HubSpot (Watch Contacts) → Anakin (UniversalDataExtractor) → HubSpot (Update Contact)
```

## Variant: research instead of raw scrape

If the goal is a qualitative summary rather than structured fields, swap
step 2 for **Perform AI Search** with a query like "What does {{company}}
do, and who is their target customer?" and write the answer into a HubSpot
note/property instead.

## Template listing copy

**Title:** Enrich HubSpot leads from their website
**Description:** The moment a new Contact or Company lands in HubSpot,
Anakin scrapes their site and writes the extracted data straight back onto
the record — no manual research.
