# Spec: `/education/events/{event_id}/lectures` — predavanja dogodka za Links vizualizacijo

> **STATUS: implementirano in priklopljeno.** Preverjeno 18. 10. 2026: `/education/events/12540/lectures`
> (MIT World) vrne 5 predavanj, neznan dogodek vrne 404, paginacija pri `30177` da 31 unikatnih
> predavanj. Hrošč z `duration` je popravljen: *Open Education × SDG 4* se v radialu naloži do konca (174/174).

**Za:** IRCAI backend team (FastAPI, `angular-visualisation.midas.ijs.si`)
**Povezano:** `specs/education-whitespace-event-details.md` · `specs/education-documents-endpoint.md` ·
News-widget Links (`10. Links`) · komentar Joao Costa, 17. 10. 2026

## Cilj

Ko uporabnik v `10. Links` klikne dogodek (npr. *MIT World Series: Learning without Barriers*),
panel pod naslovom, datumom in opisom pokaže **seznam predavanj tega dogodka**. Vsako predavanje
je povezava na svojo stran na VideoLectures. Enako kot seznam predavanj pri kliku na segment v
radialu (`3. Radial`).

## Zakaj rabimo nov endpoint

- `/education/whitespace` vrne dogodke (`id`, `title`, `date`, `description`, `url`), predavanj pa ne.
- `/education/intersection/documents` vrne predavanja z `event_id`, vendar zahteva `topic` + `sdg`.
  Parameter `event_id` tiho ignorira (`&event_id=33993` vrne vseh 174 dokumentov segmenta).
- Na frontendu predavanj ne moremo zbrati sami. Dogodek se razteza čez več topicov in SDG-jev,
  zato bi morali prebrati vse segmente in jih filtrirati v brskalniku.

ID-ji se ujemajo, kar je preverjeno: vseh 23 `event_id` iz segmenta *Open Education × SDG 4* obstaja
v `/education/whitespace` z enakim naslovom (npr. `21391` = *Research Track*, `32648` = *Open
Education for a Better World Eduscope 2022*). Endpoint lahko torej uporabi isti `event_id`.

## Funkcionalne zahteve

- [ ] `GET /education/events/{event_id}/lectures`
  - path: `event_id` (int) — `id` iz `/education/whitespace` oz. `event_id` iz dokumentov
  - query: `page` (int, default 1), `page_size` (int, default 20, max 100), `format` (kot ostali endpointi)
- [ ] Vrne **vsa** predavanja dogodka iz education indeksa, ne glede na topic, SDG ali pilot
- [ ] Stabilno urejanje: `date` padajoče, nato `id`, da paginacija ne podvaja in ne izpušča vrstic
- [ ] Oblika dokumenta je **enaka** kot `SegmentDocument` iz `/education/intersection/documents`,
      tako da frontend uporabi isto vrstico kot v radialu

## Podatkovni model / API

```json
{
  "event_id": 33993,
  "event_title": "OE4BW Strategic Meeting and LOE on-campus 2024",
  "total": 12,
  "page": 1,
  "page_size": 20,
  "has_more": false,
  "excluded_count": 0,
  "documents": [
    {
      "id": "34398",
      "title": "Open Education: a broken promise?",
      "url": "https://videolectures.net/videos/OE4BWMeetingon2024_groot_kormelnik_promise",
      "slug": "OE4BWMeetingon2024_groot_kormelnik_promise",
      "description": "How we make better",
      "date": "2024-10-09",
      "duration": 3678,
      "views": 36,
      "event_id": 33993,
      "event_title": "OE4BW Strategic Meeting and LOE on-campus 2024",
      "authors": ["Joost Groot Kormelnik"],
      "sdgs": ["SDG 4"],
      "pilots": ["LACeduc"]
    }
  ]
}
```

Obvezna polja dokumenta: `id`, `title`, `url`. `url` mora biti delujoča povezava na predavanje.
`total` je število vseh vrnjenih predavanj (po izločitvi, glej spodaj), ne velikost strani.

## Robni primeri & error handling

- neznan `event_id` → `404` z `{"detail": "Unknown event"}`
- dogodek obstaja, a nima predavanj → `200`, `total: 0`, prazen `documents`
- predavanje brez naslova ali URL-ja → izpusti ga in ga prištej v `excluded_count`
- `page` izven obsega → `200`, prazen `documents`, pravilen `total`
- `page_size > 100` → omeji na 100 (ne 422)
- `duration` z decimalko → ne sme podreti odgovora (glej naslednje poglavje)

## Obstoječi hrošč, ki ga je treba popraviti hkrati

`/education/intersection/documents` vrne **500**, ko je na strani predavanje z necelim `duration`:

```
GET /education/intersection/documents?topic=Open%20Education&sdg=SDG%204&page=8&page_size=20
→ 500 {"detail": "Failed to process request: 1 validation error for SegmentDocument
       duration  Input should be a valid integer, got a number with a fractional part
       [type=int_from_float, input_value=3815.04, input_type=float]"}
```

Strani 8 in 9 tega segmenta (in `page=2&page_size=100`) zato padejo. V radialu se seznam ustavi
pri ~140 od 174 predavanj. Predlog: `duration: float | None` v modelu `SegmentDocument` oz.
zaokroževanje pred validacijo. Nov endpoint uporablja isti model, zato bi brez popravka padal enako.

## Acceptance criteria

- [ ] `GET /education/events/33993/lectures` vrne predavanja dogodka *OE4BW Strategic Meeting and LOE on-campus 2024*, vsa z `event_id: 33993`
- [ ] Paginacija skozi vse strani da natanko `total` unikatnih `id`, brez podvojitev
- [ ] Vsak dokument ima neprazen `title` in delujoč `url`
- [ ] Neznan `event_id` vrne 404
- [ ] `/education/intersection/documents?topic=Open%20Education&sdg=SDG%204` se da prebrati do konca brez 500
- [ ] Odziv za `page_size=20` pod 1 s

## Izven obsega

- Filtriranje predavanj po SDG ali topicu znotraj dogodka
- Iskanje po besedilu
- Sprememba `/education/whitespace`

## Frontend, ko bo endpoint objavljen

- `EducationService.getEventLectures(eventId, page)`
- V `app-links-event-details` seznam pod opisom, z isto vrstico (naslov · datum · trajanje) in
  enakim nalaganjem ob scrollanju kot `radial-segment-details.component.ts`. Če je smiselno, se
  seznam izloči v skupno komponento.
- Ob izbiri drugega dogodka se seznam ponastavi.
