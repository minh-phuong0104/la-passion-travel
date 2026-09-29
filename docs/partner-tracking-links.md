# La Passion Travel — Partner Tracking Links

Use a different URL for every social account. The site already stores:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- first-touch and last-touch attribution

No database migration is required for partner classification.

Base site used below:
`https://la-passion-travel-phi.vercel.app`

## Instagram

| Account | Tracking URL |
|---|---|
| Vietnammoment | `https://la-passion-travel-phi.vercel.app/journey?utm_source=instagram&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnammoment` |
| Vietnam By Local | `https://la-passion-travel-phi.vercel.app/journey?utm_source=instagram&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnam_by_local` |
| Vietnam Foodie | `https://la-passion-travel-phi.vercel.app/journey?utm_source=instagram&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnam_foodie` |
| Vietnam Sip n Eat | `https://la-passion-travel-phi.vercel.app/journey?utm_source=instagram&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnam_sip_n_eat` |
| La Passion Travel | `https://la-passion-travel-phi.vercel.app/journey?utm_source=instagram&utm_medium=social&utm_campaign=partner_referral&utm_content=la_passion_travel` |

## Facebook

| Account | Tracking URL |
|---|---|
| Vietnammoment | `https://la-passion-travel-phi.vercel.app/journey?utm_source=facebook&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnammoment` |
| Vietnam By Local | `https://la-passion-travel-phi.vercel.app/journey?utm_source=facebook&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnam_by_local` |
| Vietnam Foodie | `https://la-passion-travel-phi.vercel.app/journey?utm_source=facebook&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnam_foodie` |
| Vietnam Sip n Eat | `https://la-passion-travel-phi.vercel.app/journey?utm_source=facebook&utm_medium=social&utm_campaign=partner_referral&utm_content=vietnam_sip_n_eat` |
| La Passion Travel | `https://la-passion-travel-phi.vercel.app/journey?utm_source=facebook&utm_medium=social&utm_campaign=partner_referral&utm_content=la_passion_travel` |

## Admin behaviour

Dashboard:
- Instagram and Facebook are separated.
- Each platform is broken down into the 5 partner accounts.
- Clicking an account opens Leads filtered to that exact source.

Leads:
- New Platform filter.
- New Partner Account filter.
- Source column displays both platform and partner.
- Partner shortcuts make one-click filtering easy.

Lead detail:
- Attribution section displays Platform and Partner Account prominently.

Important: the partner must use the matching tracking URL. If they post only the plain `/journey` URL, the admin cannot know which exact IG/FB account referred that lead.
