# Spec: `/education/intersection/documents` — dokumenti za segment radiala

**Za:** IRCAI backend team (FastAPI, `angular-visualisation.midas.ijs.si`)
**Povezano:** IRCAI-SDGobservatory/data#63 · News-widget radial (`3. Radial`)

## Cilj

Ko uporabnik klikne segment v radialu, mora widget pokazati **katera predavanja stojijo za to številko** (kot v Event Registry: klik na kos → seznam vsebine). Trenutno ima API samo agregacije — ni načina, da bi prišli do posameznih dokumentov. Frontend tega ne more rešiti sam, ker topic model (BERTopic) živi na backendu in mapping dokument→topic ne obstaja nikjer drugje.

## Kontekst

Radial polni `GET /education/intersection/` (SDG pogled) oz. `GET /education/intersection/pilot/{pilot_field}` (pilot pogled) iz **education indeksa** (VideoLectures). Odgovor:

```json
[{"sdg":"Open Education","total_count":433,
  "sdg_intersections":[{"key":"SDG 4","value":433},{"key":"SDG 8","value":217}]}]
```

Vsak `sdg_intersections` element je en segment v radialu. Ta spec dodaja endpoint, ki za točno tak segment vrne dokumente, ki so bili prešteti v `value`.

**Ključna zahteva:** `len(documents)` mora biti **enak** `value` iz `/education/intersection/` za isti (topic, key) par. Če se ne ujema, je klik neuporaben — uporabnik vidi 217 in dobi 30 zadetkov.

## Funkcionalne zahteve

- [ ] `GET /education/intersection/documents` — dokumenti za en segment SDG pogleda
  - query: `topic` (str, **required**), `sdg` (str, **required**, oblika `"SDG 4"` — enaka kot `sdg_intersections[].key`), `page` (int, default 1), `page_size` (int, default 20, max 100), `format` (enako kot ostali endpointi)
- [ ] `GET /education/intersection/pilot/{pilot_field}/documents` — isto za pilot pogled
  - path: `pilot_field` (obstoječi enum: `Landslides`, `OER1`–`OER5`, `OER-all`, `OBIA1`–`OBIA3`, `COP30`, `ELIAS`, `AImovement`, `RaD`, `Quantum`)
  - query: `topic` (required), `key` (required — OER oznaka iz `sdg_intersections[].key`), `page`, `page_size`
- [ ] Oba uporabita **isti filter kot agregacija**, ki je proizvedla `value` — ne približka, ne ponovnega poizvedovanja po drugi logiki
- [ ] Rezultati stabilno urejeni (privzeto `date` padajoče, sekundarno `id`), da paginacija ne podvaja in ne izpušča vrstic

## Podatkovni model / API

```json
{
  "topic": "Open Education",
  "key": "SDG 4",
  "total": 433,
  "page": 1,
  "page_size": 20,
  "documents": [
    {
      "id": "30177_12",
      "title": "Opening keynote: OER in higher education",
      "url": "https://videolectures.net/...",
      "date": "2020-09-17",
      "event_id": 30177,
      "event_title": "Open Education Eduscope 2020",
      "authors": ["..."],
      "sdgs": ["SDG 4", "SDG 8"],
      "pilots": ["OER1"]
    }
  ]
}
```

Obvezna polja: `id`, `title`, `url`, `date`, `event_title`, `sdgs`.
`url` mora biti **odprta povezava na predavanje** — brez tega je seznam mrtev tekst. Če URL za dokument ne obstaja, vrni `null` in ga frontend ne bo linkal.
`total` je število **vseh** dokumentov v segmentu (ne velikost strani) in mora ustrezati `value` iz agregacije.

## Robni primeri & error handling

- `topic` neznan → `404` z `{"detail": "Unknown topic"}` (ne prazen 200 — frontend mora ločiti "ni zadetkov" od "napačen topic")
- `sdg` / `key` ni med `sdg_intersections` za ta topic → `200` s `total: 0` in praznim `documents`
- `sdg` v napačni obliki (`"4"` namesto `"SDG 4"`) → sprejmi oboje, normaliziraj
- `page` izven obsega → `200`, prazen `documents`, pravilen `total`
- `page_size > 100` → clamp na 100 (ne 422)
- manjka `topic` → `422` (FastAPI privzeto)
- dokument brez naslova ali URL-ja → **izpusti iz odgovora in odštej od `total`**; trenutni `/education/whitespace` vrača `{"id": null, "title": null}` vnose in to ne sme priti do uporabnika

## Odprto vprašanje za backend — dvojno štetje

`/education/intersection/` za "Open Education" vrne `total_count: 433`, segmenti pa `SDG 4: 433`, `SDG 8: 217`, `SDG 9: 110`. Isti dokument je štet v več SDG-jih, radial pa jih zlaga → stolpec kaže ~760 dokumentov, čeprav jih je 433.

Ko bo ta endpoint delal, bo to vidno takoj (isto predavanje v dveh segmentih). Prosimo za potrditev, kaj je namen:
1. **Prekrivanje je pričakovano** — vsak segment je "koliko dokumentov tega topica se dotika tega SDG", stolpec ni vsota → potem naj `/education/intersection/` doda `total_count` v vsak odgovor (že je) in mi na FE popravimo os, da ne trdi vsote.
2. **Vsak dokument naj šteje enkrat** (primarni SDG) → potrebna sprememba agregacije, ne tega endpointa.

Ta odgovor rabimo **preden** gremo v produkcijo s klikom.

## Acceptance criteria

- [ ] `GET /education/intersection/documents?topic=Open%20Education&sdg=SDG%204` vrne `total` = 433, tj. enako kot `value` v `/education/intersection/`
- [ ] Paginacija skozi vse strani da natanko `total` unikatnih `id` vrednosti, brez podvojitev
- [ ] Vsak vrnjen dokument ima neprazen `title`; `url` je bodisi odprta povezava bodisi `null`
- [ ] Pilot varianta vrne enake številke kot `/education/intersection/pilot/{pilot_field}`
- [ ] Neznan `topic` vrne 404, neznan `key` vrne 200 s `total: 0`
- [ ] Odziv za `page_size=20` pod 1 s

## Izven obsega

- Iskanje/filtriranje po besedilu znotraj segmenta
- Filter po letu ali regiji
- Vračanje transkriptov ali vsebine predavanj — samo metapodatki
- Sprememba obstoječih agregacijskih endpointov (razen odgovora na vprašanje o dvojnem štetju)

## Predpostavke

- Education indeks hrani `url` do predavanja na videolectures.net. Če ga ne, povejte — potem rabimo vsaj `event_id` + dovolj za sestavo povezave, sicer je seznam neklikabilen.
- Dokument = posamezno **predavanje**, ne event/konferenca. `/education/whitespace` vrača evente; radial šteje dokumente, zato pričakujemo predavanja.
- Avtentikacija enaka kot pri ostalih endpointih (brez).
- CORS že dovoljuje `news-widget.pages.dev` — isti origin kot ostali klici.
