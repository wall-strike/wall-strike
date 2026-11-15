# WALL STRIKE

Arkádová hra do prohlížeče: skáčeš mezi dvěma zdmi nahoru, sbíráš mince, vyhýbáš se bodcům, blokům a zlým kuřatům a za mince otevíráš bedýnky (cases) s novými skiny agentů, nožů a rukavic. Hra je jedna stránka, funguje na PC i na mobilu a jako PWA i offline.

## Jak hru hrát

Hra si sama vybere rozložení podle obrazovky. Na **PC** (okno na šířku) běží v 16:9 a doporučená je celá obrazovka (`F`). Na **mobilu na výšku** se šachta natáhne přes celou obrazovku. Mobil můžeš otočit i na šířku; při otočení za běhu se hra pozastaví.

**Cíl:** vyskákej co nejvýš. Skáčeš mezi dvěma zdmi, sbíráš mince a vyhýbáš se překážkám. Za mince si v menu kupuješ bedýnky se skiny.

**Překážky:** bodce na zdech, dřevěné bedny a kuřata, která létají sem a tam přes šachtu.

**Sběratelné věci:** mince ($), modré diamanty (víc peněz a navíc 1 gem) a štít, který tě jednou zachrání.

**Hrát:** https://wallstrike.vercel.app/

## Ovládání

| Akce | Mobil | PC |
|---|---|---|
| Dlouhý skok na protější zeď | klepnutí na protější polovinu obrazovky | `A` / `D` nebo šipky |
| Hop na vlastní zdi | klepnutí na vlastní stranu | `A` / `D` nebo šipky |
| Sklouznutí / skok dolů | tah prstem dolů | `S` / `↓` |
| Dvojitý skok | klepnutí ve vzduchu | `Space` / `W` ve vzduchu |
| Pauza (menu: pokračovat, restart, zvuk, lobby) | tlačítko vpravo nahoře | `P` / `Esc` |
| Ukončit běh | – | `Q` v pauze (`L` = lobby) |
| Celá obrazovka | Nastavení | `F` nebo Nastavení |

Kombo (sbírání mincí a prolétávání překážek bez pádu) násobí výdělek z mincí. Mapy se odemykají podle nejlepšího skóre.

## Menu

- **Play** – začne běh.
- **Inventory** – vybereš si agenta, nůž a rukavice (zamčené věci získáš z bedýnek).
- **Shop** – dvě stránky (přejeď doprava, klikni na záložku nebo použij ←/→). Na první se po kliknutí na bedýnku nejdřív ukážou šance všech předmětů a až pak ji otevřeš za mince (duplikát vrátí část peněz). Na druhé, **Gem Shopu**, koupíš za 500 gemů agenty Monesy, ZywOo a Donk.
- **Maps** – seznam map a odměn; mapa se odemyká dosaženým skóre.
- **Settings** – hlasitost, zvuk, celá obrazovka a reset postupu.

## Tipy

- Hru neukládej do složky bez webového serveru: z `file://` nefunguje správně.
- Postup se ukládá v prohlížeči. Když smažeš data webu, přijdeš o něj.
- Hra se při přepnutí na jiné okno nebo otočení telefonu sama pozastaví.
- V bedýnce vidíš u každé položky celý název včetně finishe (např. „Butterfly Knife / Fade“), stejný název se ukáže i při otevření.

## Spuštění lokálně

Hra načítá obrázky a zvuk ze souborů, takže ji nespouštěj dvojklikem (`file://`), ale přes lokální server:

```
python3 -m http.server 8000
```

a otevři `http://localhost:8000`. Service worker (offline režim) se registruje jen přes `http(s)`.

## Struktura

```
index.html              kostra stránky a seznam skriptů (pořadí je důležité)
css/style.css           styly
js/                     herní kód, obyčejné skripty se společným globálním prostorem:
  debug.js                sběr chyb a ?debug pomůcky
  core.js                 konstanty, DOM odkazy, rozložení obrazovky
  data.js                 data: skiny (tabulka SKINS), mapy, bedýnky, šance
  save.js                 uložená hra
  audio.js                zvuk
  sprites.js              kreslení agentů, nožů, rukavic
  world.js                kreslení světa a pozadí
  game.js                 logika běhu (překážky, mince, skóre, konec hry)
  ui.js                   menu, inventář, obchod, bedýnky, mapy, nastavení
  input.js                klávesnice, dotyk, celá obrazovka, registrace service workeru
  main.js                 herní smyčka, pauza, start
assets/                 obrázky, zvuk, písmo, ikony
sw.js                   service worker (offline cache; seznam souborů se generuje)
manifest.webmanifest    PWA manifest
tools/                  kontrola a test projektu (hra je nepotřebuje)
CLAUDE.md               pravidla a přehled pro práci na projektu
```

## Přidání nového skinu

1. Přidej průhledné WebP do `assets/agents/`, `assets/gloves/` nebo `assets/knives/` (agenti ~200 px široké, rukavice ~180 px, nože ~260 px vodorovně, rukojeť vlevo, hrot vpravo).
2. Přidej jeden řádek do tabulky `SKINS` v `js/data.js` (typ, id, jméno, rarita, cesta k obrázku, barvy).
3. Spusť `node tools/check.mjs --write`. Zkontroluje soubory a ekonomiku bedýnek a sám obnoví seznam souborů a verzi cache v `sw.js`.

Podrobnosti a pravidla ekonomiky bedýnek jsou v `CLAUDE.md`.

## Kontrola a ladění

- `node tools/check.mjs` – rychlá kontrola projektu (chybějící nebo nepoužité soubory, aktuálnost `sw.js`, ekonomika bedýnek). Žádné závislosti, běží i v GitHub Actions. `--write` obnoví `sw.js`.
- `node tools/smoke.mjs` – test v prohlížeči (potřebuje Playwright): chyby v konzoli, offline režim, načítání uložení a simulace běhu proti `tools/golden.json`.
- `http://localhost:8000/?debug` – červený pruh s chybami a v konzoli příkazy `dbg.give(id)`, `dbg.cash(n)`, `dbg.god()` a další (výpis je v `CLAUDE.md`).

## Uložení hry

Postup se ukládá do `localStorage` pod klíčem `pigstrike` (starý název hry, neměnit bez migrace). Při načtení se uložení ověřuje a poškozený záznam se zazálohuje do `pigstrike_bak`. Nákup bedýnky se zapisuje hned po losování, takže se při obnovení stránky neztratí peníze ani předmět.

## Nasazení

Statický web, bez build kroku. Hostuje se na Vercelu; stačí nahrát soubory do větve `main`.
