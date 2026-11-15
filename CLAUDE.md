# CLAUDE.md – Wall Strike

**Tento soubor si přečti jako první, před jakoukoli prací v repozitáři.** Popisuje, co projekt je, jak je poskládaný, jak je psaný kód a jak v něm pracovat. Když se tvoje práce s tímto souborem rozchází, buď uprav kód, nebo navrhni úpravu tohoto souboru. Nevymýšlej si vlastní pravidla.

## 1. Jak pracovat

**Komunikace**
- S majitelem piš **česky**, stručně a věcně. Nejdřív řekni, co jsi udělal, potom případné problémy.
- Kód, názvy proměnných, commity a texty ve hře (UI) jsou **anglicky**. README je česky (je pro hráče).
- Nic si nevymýšlej. Když něco nevíš nebo nemůžeš ověřit, řekni to. Nepiš, že něco funguje, pokud jsi to nespustil.
- Když je zadání nejasné, zvol rozumný výklad, řekni jaký, a udělej to. Ptej se jen tehdy, když by špatný odhad znamenal velkou práci navíc.

**Rozsah změn**
- Dělej změny co nejmenší a cílené. Neopravuj „při té příležitosti“ nesouvisející věci, jen je navrhni.
- Žádné velké přepisy, refaktoring, přeformátování souborů, nové knihovny ani build krok bez výslovného souhlasu.
- Nemaž ani nepřepisuj postup hráčů (viz kapitola Uložení).

**Ověření před odevzdáním** (nic neodevzdávej, co jsi nespustil)
1. Po **každé** změně souborů (kód, CSS, obrázky, přidání i smazání) spusť `node tools/check.mjs --write`. Zkontroluje projekt a přegeneruje `sw.js`. Výsledek musí být `All checks passed.`
2. Když měníš chování hry nebo data, spusť i `node tools/smoke.mjs` (potřebuje Playwright). Viz kapitola Ověřování.
3. Hru vždy skutečně spusť přes `http://localhost` (např. `python3 -m http.server`) a podívej se na ni (menu, inventář, bedýnky, běh). Přečtení kódu nestačí.

**Předání práce majiteli**
- Majitel pracuje přes **web GitHubu, bez konzole a bez gitu**. Neposílej mu příkazy `git`, pošli soubory a klikací postup.
- Pošli **jen změněné soubory**, ne celý projekt.
- `sw.js` obsahuje otisk všech souborů hry, takže se změní při **každé** změně v `js/`, `css/`, `assets/`, `index.html` nebo `manifest.webmanifest`. Vždy ho přilož a vždy v něm měj čerstvě vygenerovaný výstup z `check.mjs --write`.
- **Smazané soubory** nejdou poslat. Vypiš je zvlášť (úplná cesta) a řekni, že se mají smazat ručně na GitHubu (soubor → ⋯ → Delete file). GitHub Actions kontrola je zelená až po posledním z těch commitů, mezitím může být červená.

## 2. Co je projekt

Arkádová hra do prohlížeče (jedna stránka). Hráč skáče mezi dvěma zdmi nahoru, sbírá mince a diamanty, vyhýbá se překážkám (bodce, bedny, pily, kuřata). Za mince otevírá bedýnky (cases) s novými skiny agentů, nožů a rukavic. Běží na https://wallstrike.vercel.app/ a funguje jako PWA (offline). **Prostý HTML/JS/CSS, bez buildu a bez závislostí.** Soubory v `tools/` jsou jen vývojářské skripty, hra je nepotřebuje.

## 3. Struktura repozitáře

```
index.html            kostra stránky + seznam skriptů (POŘADÍ SKRIPTŮ JE DŮLEŽITÉ)
manifest.webmanifest  PWA manifest (musí zůstat v kořeni)
sw.js                 service worker; blok mezi // <generated> a // </generated> GENERUJE tools/check.mjs --write, ručně ho nikdy neměň
css/style.css         všechny styly; na začátku je style guide v komentáři
js/                   herní kód, obyčejné skripty se sdíleným globálním prostorem (viz níže)
assets/               obrázky (WebP), písmo, zvuk, ikony: agents/ gloves/ knives/ maps/ ui/ digits/ fonts/ audio/ icons/
tools/check.mjs       rychlá kontrola projektu (bez závislostí, běží i v GitHub Actions)
tools/smoke.mjs       test v prohlížeči (Playwright) + tools/golden.json
.github/workflows/    GitHub Actions: spouští `node tools/check.mjs` při každém pushi
CLAUDE.md, README.md  pravidla pro Claude / popis hry pro hráče
```

### Skripty v `js/` (spouští se v tomto pořadí, jak jsou v `index.html`)
| Soubor | Co dělá |
|---|---|
| `debug.js` | `DBG` (sběr chyb), `?debug` pomůcky. Načítá se první, aby viděl chyby ze všech ostatních |
| `core.js` | konstanty, DOM odkazy (`$`, `E`, `C`, `X`, `tp`, `menu`, `pn`, `ov`, `st`), `layout()` (rozměry `W`,`H`,`LX`,`RX`) |
| `data.js` | statická data: `SKINS`, `RAR`, `MAPS`, `MODS`, `FIN`, `CS`, `WT`, `REF`, `cprob()`, `roll()`. Žádný stav a žádné DOM (kromě obrázků map). **Musí běžet samo o sobě**, `check.mjs` ho spouští v sandboxu |
| `save.js` | uložená hra `S`, `loadSave()`, `save()`, migrace |
| `audio.js` | zvuk: `tone()`, vzorky `smp()`, zvuk otevření bedýnky |
| `sprites.js` | kreslení položek: `animal()`, `knife()`, `glove()`, `icon()`, `kimg()`; načítání obrázků skinů |
| `world.js` | kreslení světa: `scene()`, `shaft()`, `bgs()`, `wall()`, `deco()`, `fx()` |
| `game.js` | logika běhu: `newRun()`, `spawn()`, `coinsArc()`, `fixCoins()`, `jump()`, `upd()`, `pick()`, `pass()`, `die()`, `end()`, kreslení běhu `drw()` |
| `ui.js` | obrazovky: `mainMenu()`, `inv()`, `cases()`, `caseDetail()`, `openCase()`, `maps()`, `sets()` |
| `input.js` | klávesnice, dotyk, `fit()`, fullscreen, wake lock, registrace service workeru |
| `main.js` | herní smyčka `loop()`, pauza, `boot()` (předčítání obrázků a fontu, pak `mainMenu()`) |

## 4. Jak kód funguje

- **Žádné moduly.** Skripty jsou obyčejné (`'use strict'` na začátku, po hlavičkovém komentáři) a sdílejí globální `let`/`const`/`function` (např. `S`, `G`, `mode`, `ITEM`, `SKINS`). Žádné `import`/`export`. Skript může používat jen to, co definoval sám nebo skript **před ním** v `index.html`.
- **Nový skript** přidej do `js/` **a** do `index.html` ve správném pořadí. `check.mjs` hlídá obojí (soubor v `js/` bez `<script>` selže).
- **Stav hry:** `mode` je `'menu'`, `'play'` nebo `'over'`. `G` je objekt aktuálního běhu (vytváří ho `newRun()`: pozice, kamera `cam`, skóre, mince, překážky `obs`, částice…). `S` je uložená hra mezi běhy.
- **Smyčka:** `loop()` (`main.js`) volá `requestAnimationFrame`, uvnitř `try/catch` s `DBG.report()`. Fyzika je v `upd(dt)`, kreslení v `drw()`/`scene()`.
- **Rozměry:** canvas má pevný logický rozměr, který se jen škáluje na obrazovku. Na šířku (PC) 1536×864 (16:9), na výšku (mobil) 600×~960–1400. `W`, `H`, `LX`, `RX` se nastavují ve `layout()`. Kód nikdy nepředpokládá pevné `W`/`H`.
- **Obrázky:** název souboru v `assets/` odpovídá klíči položky. Obrázky se načítají přes `new Image()` a před startem se předdekódují v `main.js`.
- **Data jsou řízená tabulkou `SKINS`** (jeden řádek = jeden skin). Z ní `data.js` skládá `ITEM`, `POOL`, `DEF()`, a `sprites.js` plní `AS` (agenti), `KI` (nože), `GI` (rukavice) a barvy `AN`.
- **Agenti** (`t:'a'`): obrázek v `AS`, barvy v `AN`. **Nože** (`t:'k'`): jeden řádek v `SKINS` se rozvine na všechny finishe `FIN` (id `k:<id>:<finish>`); výjimku pro `karambit` má natvrdo `kimg()`, nový nůž ji nemá. **Rukavice** (`t:'g'`): obrázek v `GI`, barvy `col`.
- **Mapy:** `MAPS` (odemykají se skóre `u`). Mapa může mít wallpaper: `bg` (WebP pod `assets/`, rozložení [levá zeď | koridor | pravá zeď]) a `bw` (šířky levé zdi a koridoru v px); kreslí ho `bgs()` a `wall()`. Zatím jen Dust II.
- **Obchod:** `cases()` skládá dvě stránky přes `shopPages()` (0 = bedýnky, 1 = Gem Shop). Klik na bedýnku otevře `caseDetail()` (množství + OPEN), teprve odtud jde `openCase()`. Obrázek bedýnky je `crUI(c)` (`assets/ui/crate-<typ>.webp`; starý `crate.webp` zůstává pro překážky ve hře). Obrazovky bedýnek (`#ov.cs`) jsou neprůhledné, barva se bere z `--c` přes `rvbg()`.
- **UI** se staví z DOM prvků (`E(tag, class, html)`) do vrstev `#top`, `#menu`, `#pn`, `#ov` nad canvasem. Styl řídí `css/style.css` (viz jeho style guide: barvy jen přes CSS proměnné, žádné nové natvrdo napsané barvy, tlačítka `.b`/`.tb`, karty `.cd .card .ri .rl`).

## 5. Jak je kód psán

- **Styl souboru má přednost.** Dívej se na okolní kód a piš stejně.
  - `js/*.js` (kromě `debug.js`): odsazení 4 mezery, **jeden příkaz na řádek**, `{}` u `if`/`else` na vlastních řádcích, jak je tam.
  - Datové tabulky (`SKINS`, `MAPS`) zůstávají **jeden záznam na řádek**.
  - `debug.js`, `sw.js` a `tools/*.mjs`: odsazení 2 mezery, kompaktnější zápis.
- Krátké názvy (`G`, `S`, `W`, `H`, `X`, `fe`, `QL`…) jsou záměr. Nepřejmenovávej je a nové názvy drž ve stejném duchu, ale nezaváděj kolize s existujícími globálními názvy (sdílí se jeden prostor, kolize = chyba při načtení).
- Komentáře jen tam, kde není zřejmé **proč** něco děláš.
- Žádné neošetřené `localStorage` ani `JSON.parse`, vždy `try/catch`.
- Chyby v běhu nepolykej mlčky: `DBG.report(err, 'místo')`. Prázdný `catch` je v kódu jen u nekritických věcí (např. zámek obrazovky, přepis `shadowBlur`).
- Texty ve hře anglicky; nové barvy nezavádět, použij proměnné ze style guide.

## 6. Jak přidat nový skin

1. Sprite jako **průhledné WebP** (bezeztrátové: `cwebp -lossless` nebo PIL `lossless=True`), bílé pozadí pryč, oříznutý, do `assets/agents/`, `assets/gloves/` nebo `assets/knives/`. Rozměry: agent ~200 px široký, rukavice ~180, nůž ~260 vodorovně, **rukojeť vlevo, hrot vpravo**.
2. Přidej **jeden řádek** do `SKINS` v `js/data.js` (komentář nad tabulkou vysvětluje pole): `t` typ (`a`/`k`/`g`), `id`, `n` jméno, `r` rarita (index do `RAR`), `img` cesta pod `assets/` bez přípony, `col` barvy (agent `{a,b,d}`, rukavice `[hlavní,tmavá]`). Volitelně:
   - `fix: .0025`: pevná šance dropu v jeho bedýnce (zbytek se dělí podle vah, počítá `cprob()`).
   - `fill: 1`: výchozí položka, která přesto padá z bedýnky (Camo v Agent Case).
   - `gem: N` (jen agenti): navíc se prodává v Gem Shopu za N gemů.
   - `def: 1`: výchozí položka (nepadá z bedýnek, dostanou ji i staří hráči); `eq: 1`: navíc vybavená na čisté hře. `def: 1` dávej jen výjimečně: hráč začíná jen s Camo, Bowie Knife a Sport Gloves Default.
   - `z`: úprava měřítka agenta.
3. `node tools/check.mjs --write` (obnoví `sw.js`, zkontroluje soubory a ekonomiku).
4. `node tools/smoke.mjs`. Přibyla položka, takže se změní „golden“ otisk: po kontrole screenshotů (`--shots dir`) ho přepiš `--update`.
5. Zkontroluj hru (inventář, bedýnky) a přečti si výpis ekonomiky z `check.mjs`.

## 7. Jak odebrat skin nebo jiný soubor

- Soubor v `assets/`, na který nic neodkazuje, `check.mjs` označí jako chybu (`unused file`). Nepoužitý soubor smaž, nebo na něj odkaž.
- **Skin ze `SKINS` nesmíš jen smazat.** Hráči, kteří ho mají v inventáři, by o něj přišli. Nejdřív ho v `js/save.js` převeď na něco hodnotného (příklad: `ghost`, `midas`, `void` se při načtení mění na gemy v poměru 150/300/500), a teprve potom smaž řádek i obrázek.
- Obrázky načítané počítaným názvem, které prosté hledání textu nevidí, musí být v `DYNAMIC_ASSETS` v `tools/check.mjs` (dnes jen `assets/ui/crate-[akg].webp`).
- Po smazání spusť `node tools/check.mjs --write` a předej majiteli i seznam smazaných souborů (viz kapitola 1).

## 8. Uložení (localStorage)

- Klíč **`pigstrike`** (starý název, **neměnit bez migrace**). Záloha poškozeného záznamu je v `pigstrike_bak`.
- Při startu se načítá přes `loadSave()` (`js/save.js`), která ověřuje tvar (typy `inv`, `eq`, čísla). Poškozený nebo neúplný záznam se před opravou zazálohuje. Nové pole v `S` přidej i do `DEF()` a do `loadSave()`.
- **Nikdy nezahazuj uloženou hru.** Změny uložené hry musí být zpětně kompatibilní: nové položky a výchozí výbavu přidávej tak, aby to fungovalo i se starým uložením (viz kontrolní řádky na konci `save.js`). Změna tvaru `S` = migrace.
- Nákup bedýnky zapisuje `S.pend` hned po losování, aby se při obnovení stránky neztratily peníze ani předmět. Tohle chování nerozbij.

## 9. Ekonomika (neměň bez dohody, hlídej poměry)

- Ceny bedýnek: Agent 400, Knife 300, Gloves 400. Vrácení za duplikát (`REF`) musí být **vždy hluboko pod cenou bedýnky**, jinak vznikne nekonečné vydělávání. `check.mjs` hlídá: největší `REF` pod nejlevnější bedýnkou, průměrné vrácení pod 25 % ceny, šance se sčítají na 1.
- Do bedýnky nikdy nedávej jedinou droppable položku (po prvním otevření by byl vždy duplikát; potřebuješ aspoň 2).
- **Gemy** (`S.gems`): druhá měna, 1 gem za každý modrý diamant nasbíraný za běh, připíše se na konci běhu v `end()`. Utrácí se jen v Gem Shopu (`gemPage()`, `buyGem()`) za agenty s `gem:N` (Monesy, ZywOo, Donk po 500; padají i z Agent Case). Ceny nejsou odladěné na reálné hraní.
- Příjem: hodnota mince = 1 (zlatá 8) × násobič komba (`mult()`) × násobič mapy. Bonus na konci běhu 1,5 % skóre × mapa.

## 10. Ověřování a ladění

- **`node tools/check.mjs`** (běží i v GitHub Actions): odkazované soubory existují; v `assets/` nejsou nepoužité soubory; všechny skripty jsou v `index.html`, mají syntaxi v pořádku a začínají `'use strict'`; tabulky položek a ekonomika dávají smysl; `sw.js` je aktuální. S `--write` přegeneruje `sw.js`.
- **`node tools/smoke.mjs`** (potřebuje Playwright/Chromium): načtení bez chyb v konzoli a bez 404, start offline a kompletní offline cache, načtení starého a poškozeného uložení, a seedovaná simulace 150 s hry, jejíž čísla se musí přesně shodovat s `tools/golden.json`. Když měníš chování hry záměrně, zkontroluj výsledek a spusť s `--update`. Když golden selže a ty jsi nic měnit nechtěl, je to chyba.
- **`?debug`** v URL (např. `http://localhost:8000/?debug`): červený pruh s chybami a v konzoli `dbg.state()`, `dbg.items()`, `dbg.give(id)`, `dbg.cash(n)`, `dbg.gems(n)`, `dbg.best(n)`, `dbg.god()`, `dbg.reset()`. Bez `?debug` se chyby jen jednou zalogují a uloží do `DBG.errors`.
- Hru spouštěj přes `http://localhost`, ne z `file://` (canvas by byl kvůli `getImageData` zablokovaný).

## 11. Známé problémy (nevydávej za opravené)

- Výběr mapy v menu Maps nemá vliv na hru: `S.map` se při startu i v `newRun()` nastaví na 0 a mapa se mění jen podle skóre.
- Mince se mohou generovat v dráze pily (možná záměr).
- Kvalita vykreslování (`QL`) se při zpomalení jen snižuje a nevrací.
- V `AN` (`js/data.js`) a `animal()` (`js/sprites.js`) zůstaly barvy a kreslení starých zvířecích postav (pig, fox, frog…). Pravděpodobně už nepoužité, před smazáním ověř, co z toho hra volá.
- Komentář nad `SKINS` v `data.js` říká „PNG“, ale obrázky jsou WebP.

## 12. Ne

- Žádné velké přepisy a refaktoring bez dohody.
- Neměň klíč ani tvar uložené hry bez migrace.
- Neměň ručně `sw.js` (ani verzi, ani seznam souborů).
- Neodevzdávej nic, co jsi nespustil, a nepiš, že to funguje, když jsi to neověřil.
