# Spec: `/education/whitespace` — podrobnosti dogodka za Links vizualizacijo

> **STATUS: frontend pripravljen, čaka backend.** Klik na vozlišče v `10. Links` odpre panel z
> naslovom dogodka. Datum, opis in povezava na VideoLectures se prikažejo samodejno, ko jih
> backend začne pošiljati — na frontendu ni treba spreminjati ničesar.

**Za:** IRCAI backend team (FastAPI, `angular-visualisation.midas.ijs.si`)
**Povezano:** `specs/education-documents-endpoint.md` · News-widget Links (`10. Links`)

## Cilj

Uporabnik klikne dogodek v grafu povezav in vidi kratek naslov, datum, opis ter gumb
"Visit on VideoLectures", ki odpre stran dogodka. Enako kot klik na segment v radialu (`3. Radial`).

## Trenutno stanje

`GET /education/whitespace` in `GET /education/whitespace/pilot/{pilot_field}` vrneta pri vsakem
dogodku samo:

```json
{"id": 15998, "title": "PRO(MO)GRAM - predstavitveni filmi ..."}
```

`id` je star VideoLectures ID; povezave iz njega ni mogoče sestaviti (`/events/30177` vrne 404,
iskanje po naslovu zadene 3 od 8 — glej `education-documents-endpoint.md`).

## Funkcionalne zahteve

Vsak element `events[]` v obeh endpointih dobi dodatna polja:

| polje | tip | opis |
|---|---|---|
| `date` | `string \| null` | ISO datum začetka dogodka (`"2024-10-09"`) |
| `description` | `string \| null` | kratek opis dogodka (plain text) |
| `url` | `string \| null` | odprta povezava na stran dogodka, npr. `https://videolectures.net/events/<slug>` |

```json
{
  "id": 33993,
  "title": "OE4BW Strategic Meeting and LOE on-campus 2024",
  "date": "2024-10-09",
  "description": "...",
  "url": "https://videolectures.net/events/OE4BWMeetingon2024"
}
```

- Obstoječa polja (`id`, `title`, `sdgs`, `similarities`) ostanejo nespremenjena.
- Če podatka ni, vrni `null` — frontend polje skrije. `url` mora biti **delujoča** povezava
  ali `null`; ne ugibane poti.
- Dogodkov z `id: null` ali `title: null` ne vračaj.

## Acceptance criteria

- [ ] Vsak dogodek iz `/education/whitespace?sdg=4` ima ključe `date`, `description`, `url`
- [ ] Vsak ne-null `url` odpre stran dogodka na videolectures.net (ne 404, ne iskanje)
- [ ] Pilot varianta vrne enaka polja
