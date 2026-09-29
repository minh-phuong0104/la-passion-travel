La Passion Travel update pack

Changes included:
1. Thank-you page gets "Start a new journey" restart button.
2. WhatsApp number becomes optional.
3. At least one contact method (email or WhatsApp) is still required.
4. Country/calling-code selector supports all countries using react-phone-number-input.
5. Journey page is compacted to fit within one desktop viewport more reliably.
6. Admin dashboard shows Instagram / Facebook / GFI source counts and source labels.

Required dependency:
    npm install react-phone-number-input

Replace the files in this ZIP at the exact same paths in your project.

For reliable source tracking, use campaign links like:
Instagram:
    https://YOUR-DOMAIN/journey?utm_source=instagram&utm_medium=paid_social&utm_campaign=NAME

Facebook:
    https://YOUR-DOMAIN/journey?utm_source=facebook&utm_medium=paid_social&utm_campaign=NAME

GFI:
    https://YOUR-DOMAIN/journey?utm_source=gfi&utm_medium=referral&utm_campaign=NAME

Then:
    npm run build
    git add .
    git commit -m "Improve journey form and lead source tracking"
    git push
