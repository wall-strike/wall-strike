# CLAUDE.md – pravidla pro práci na Wall Strike

Tento soubor čti na začátku každé práce v repozitáři. Je to krátký přehled projektu a pravidla, jak v něm psát a kódovat.

## Jak komunikovat
- S majitelem projektu piš **česky**, stručně a věcně. Nejdřív řekni, co jsi udělal, pak případné problémy.
- Kód, názvy proměnných, commity a texty ve hře (UI) jsou **anglicky**. Komentáře v kódu piš jen tam, kde není zřejmé *proč* něco děláš.
- Nic si nevymýšlej. Když něco nevíš nebo nemůžeš ověřit, řekni to. Nepiš, že něco funguje, pokud jsi to nespustil.
- Když je zadání nejasné, zvol rozumný výklad, řekni jaký a udělej to. Ptej se jen tehdy, když by špatný odhad znamenal velkou práci navíc.
- Nemaž ani nepřepisuj postup hráčů. Změny uložené hry musí být zpětně kompatibilní (viz Uložení).

## Co je tohle za projekt
Arkádová hra do prohlížeče (jedna stránka): hráč skáče mezi dvěma zdmi nahoru, sbírá mince, vyhýbá se překážkám a za mince si otevírá bedýnky (cases) s novými skiny. Běží na https://wallstrike.vercel.app/ a funguje jako PWA (offline). Prostý HTML/JS/CSS, bez buildu a bez závislostí.

## Struktura
```
index.html            kostra stránky + seznam skriptů (POŘADÍ SKRIPTŮ JE DŮLEŽITÉ)
css/style.css         styly (style guide je v komentáři na začátku)
js/                   herní kód; obyčejné skripty se společným globálním prostorem, spouští se v tomto pořadí:
  debug.js              sběr chyb, ?debug pomůcky (načítá se první, aby viděl všechny chyby)
  core.js               konstanty, DOM odkazy, layout() (rozměry W,H,LX,RX)
  data.js               SKINS, RAR, MAPS, CS (bedýnky), WT, REF, cprob(), roll(); žádný stav ani DOM
  save.js               uložená hra S, loadSave(), save(), migrace
  audio.js              zvuk (tone, SMP/smp, case-open)
  sprites.js            kreslení položek: animal(), knife(), glove(), icon()
  world.js              kreslení světa: scene(), shaft(), bgs(), wall(), fx()
  game.js               logika běhu: newRun(), spawn(), coinsArc(), fixCoins(), upd(), pick(), pass(), die(), end(), kreslení drw()
  ui.js                 obrazovky: mainMenu(), inv(), cases(), caseDetail(), openCase(), maps(), sets()
  input.js              klávesnice, dotyk, fit(), fullscreen, registrace service workeru
  main.js               herní smyčka loop(), pauza pz(), start boot()
assets/               obrázky (WebP), písmo, zvuk, ikony; název souboru = klíč položky
sw.js                 service worker; seznam souborů a verzi cache GENERUJE tools/check.mjs --write
manifest.webmanifest  PWA manifest (zůstává v kořeni)
tools/check.mjs       kontrola projektu (bez závislostí)
tools/smoke.mjs       test v prohlížeči (Playwright) + tools/golden.json
```
- Nový skript přidej do `js/` **a** do `index.html` ve správném pořadí (`check.mjs` hlídá obojí). Soubory sdílejí globální `let`/`const` (např. `S`, `G`, `mode`), proto žádné `import`/moduly.
- Hra načítá obrázky a zvuk ze souborů, takže ji spouštěj přes `http://localhost` (např. `python3 -m http.server`), ne z `file://` (canvas by byl kvůli `getImageData` zablokovaný).

## Důležité součásti kódu
- **Data položek (`js/data.js`):** tabulka `SKINS` (jeden řádek = jeden skin), z ní se skládají `ITEM`, `POOL`, `add()`, `DEF`, `AS`/`GI`/`KI` a barvy agentů v `AN`; rarity `RAR`; váhy dropu `WT`; vrácení za duplikát `REF`; bedýnky `CS`.
- **Agenti** (typ `a`): sprite v `AS`, barvy v `AN`. **Nože** (typ `k`): sprity v `KI`, finishe `FIN` (jeden řádek v `SKINS` se rozvine na všechny finishe). **Rukavice** (typ `g`): sprity v `GI`.
- **Mapy:** v `MAPS` může mít mapa wallpaper: pole `bg` (WebP pod `assets/`, rozložení [levá zeď | koridor | pravá zeď]) a `bw` (šířka levé zdi a koridoru v px); kreslí ho `bgs()` a `wall()`. Zatím jen Dust II (`assets/maps/dust2.webp`).
- **Obchod (SHOP):** `cases()` skládá dvě stránky přes `shopPages()` (vodorovný scroll-snap, záložky, šipky a klávesy ←/→ přes `shopPg()`): 0 = bedýnky, 1 = Gem Shop. Kliknutí na bedýnku otevře stránku šancí `caseDetail()` (množství + OPEN), teprve z ní jde `openCase()`. Obrázek bedýnky je `crUI(c)` (`assets/ui/crate-<typ>.webp`; starý `crate.webp` zůstává jen pro překážky ve hře). `openCase()` ukáže jeden pruh na každou otevřenou bedýnku. Obrazovky bedýnek (`#ov.cs`) jsou neprůhledné a barva pozadí se bere z `--c` přes `rvbg()`.
- **Uložení:** objekt `S` v `localStorage` pod klíčem `pigstrike` (starý název, **neměnit bez migrace**).
- `kimg()` má natvrdo výjimku pro nůž `karambit` (přebarvení finishe Default). Nový nůž ji nemá.

## Jak přidat nový skin
1. Sprite jako průhledné WebP (bezeztrátové, `cwebp -lossless` nebo PIL `lossless=True`; bílé pozadí pryč, oříznuté) do `assets/agents/`, `assets/gloves/` nebo `assets/knives/`. Agenti ~200 px široké, rukavice ~180, nože ~260 vodorovně, **rukojeť vlevo, hrot vpravo**.
2. Přidat jeden řádek do `SKINS` v `js/data.js` (komentář nad tabulkou vysvětluje pole): `t` typ (`a`/`k`/`g`), `id`, `n` jméno, `r` rarita, `img` cesta pod `assets/` bez přípony, `col` barvy (agent `{a,b,d}`, rukavice `[hlavní,tmavá]`). Hráč začíná jen se třemi výchozími položkami (Camo, Bowie Knife, Sport Gloves Default); všechno ostatní se získává z bedýnek, takže `def:1` dávej jen výjimečně. `fix:.0025` = pevná šance dropu v jeho bedýnce (zbytek si rozdělí ostatní položky podle vah; počítá `cprob()`), `fill:1` = výchozí položka, která z bedýnky přesto padá (Camo je běžná výplň Agent Case). `gem:N` (jen agenti) = skin se navíc prodává na stránce Gem Shop za N gemů. `def:1` = výchozí položka (nepadá z bedýnek, dostanou ji i staří hráči), `eq:1` navíc = vybavená na čisté hře.
3. Spustit `node tools/check.mjs --write` (obnoví seznam souborů a verzi cache v `sw.js`, zkontroluje soubory a ekonomiku).
4. Spustit `node tools/smoke.mjs`. Protože přibyla položka, změní se „golden“ otisk; po kontrole screenshotů (`--shots dir`) ho přepiš `--update`.
5. Zkontrolovat ve hře (inventář, bedýnky) a přepočítat ekonomiku bedýnek (viz Ekonomika; `check.mjs` ji vypíše).

## Pravidla pro kód
- Žádné nové knihovny ani build krok bez schválení. Hra je záměrně prostý HTML/JS/CSS. `tools/` jsou jen vývojářské skripty a hra je nepotřebuje.
- Drž se stávajícího stylu (krátké názvy, `const`/`let`, canvas se velikostí přizpůsobí: na šířku 1536×864 (16:9), na výšku 600×~1000–1400; rozměry `W`,`H`,`LX`,`RX` se nastavují ve `layout()`). Kód je formátovaný po jednom příkazu na řádek (odsazení 4 mezery); data v tabulkách (`SKINS`, `MAPS`) zůstávají jeden záznam na řádek.
- Změnu dělej co nejmenší a cílenou. Neopravuj „při té příležitosti“ nesouvisející věci, jen je navrhni. Nepřeformátovávej soubory.
- Žádné neošetřené `localStorage`/`JSON.parse`, vždy `try/catch`.
- Chyby v běhu nepolykej mlčky: použij `DBG.report(err, 'místo')` (viz Ladění).
- Po **jakékoli** změně souborů spusť `node tools/check.mjs --write`. Verze cache v `sw.js` se tím přepočítá z obsahu souborů, ručně ji nikdy neměň. Seznam souborů se generuje také, nikdy ho nepiš ručně.

## Uložení (localStorage)
- Uložení se při startu načítá přes `loadSave()` (`js/save.js`), která ověřuje tvar (typy `inv`, `eq`, čísla). Poškozený nebo neúplný záznam se před opravou zazálohuje do klíče `pigstrike_bak`. Nové pole v `S` přidej i sem.
- Nikdy nezahazuj uloženou hru. Nové položky a výchozí výbavu přidávej tak, aby to fungovalo i se starým uložením (viz kontrolní řádky v `save.js`).
- Odstraněné položky se musí převést na něco hodnotného (příklad: `ghost`, `midas`, `void` se při načtení mění na gemy). Smazat skin ze `SKINS` bez převodu = hráč o něj přijde.
- Pokud změníš tvar `S`, přidej migraci. Změna klíče `pigstrike` bez migrace hráčům smaže postup.
- Nákup bedýnky zapisuje `S.pend` hned po losování, aby se při obnovení stránky neztratily peníze ani předmět. Tohle chování nerozbij.

## Ekonomika (neměň bez dohody, hlídej poměry)
- Ceny bedýnek: Agent 400, Knife 300, Gloves 400. Vrácení za duplikát (`REF`) musí být **vždy hluboko pod cenou bedýnky**, jinak vznikne nekonečné vydělávání. `node tools/check.mjs` to hlídá (největší `REF` pod nejlevnější bedýnkou, průměrné vrácení pod 25 % ceny, šance se sčítají na 1).
- **Gemy** (`S.gems`): druhá měna, 1 gem za každý modrý diamant (`c.g`) nasbíraný za běh, připíše se na konci runu v `end()`. Utrácí se jen v Gem Shopu (`gemPage()`, `buyGem()`) za agenty s `gem:N` (Monesy, ZywOo a Donk po 500; padají i z Agent Case). Diamant padá zhruba v 12 % oblouků mincí. Ceny nejsou odladěné na reálné hraní, uprav je v `SKINS`.
- Příjem: hodnota mince = `1` (zlatá `8`) × násobič kombo × násobič mapy. Bonus na konci runu 1,5 % skóre × mapa.
- Do bedýnky nikdy nedávej jedinou položku (po prvním otevření je vždy duplikát).

## Ověřování a ladění
- **`node tools/check.mjs`** (rychlé, bez závislostí; běží i v GitHub Actions): soubory, na které se odkazuje, existují; v `assets/` nejsou nepoužité soubory; všechny skripty jsou v `index.html` a mají syntaxi v pořádku; `sw.js` je aktuální; tabulky položek a ekonomika dávají smysl.
- **`node tools/smoke.mjs`** (potřebuje Playwright/Chromium): načtení bez chyb v konzoli a bez 404, start offline a kompletní offline cache, načtení starého a poškozeného uložení, a seedovaná simulace 150 s hry, jejíž čísla se musí přesně shodovat s `tools/golden.json`. Když změníš chování hry záměrně, zkontroluj výsledek a spusť s `--update`. Pokud golden selže a ty jsi nic měnit nechtěl, je to chyba.
- **`?debug`** v URL (např. `http://localhost:8000/?debug`): červený pruh s chybami (výjimky, nezachycené promise, nenačtené soubory) a v konzoli `dbg.state()`, `dbg.give(id)`, `dbg.cash(n)`, `dbg.gems(n)`, `dbg.best(n)`, `dbg.god()`, `dbg.reset()`. Bez `?debug` se nic nezobrazuje, chyby se jen jednou zalogují do konzole a uloží do `DBG.errors`.
- Po změně vždy hru spusť a prohlédni si screenshot (menu, inventář, bedýnky, běh); samotné přečtení kódu nestačí.

## Známé problémy (nevydávej za opravené)
- Výběr mapy v menu Maps nemá vliv na hru: `S.map` se při startu i v `newRun()` nastaví na 0 a mapa se mění jen podle skóre.
- Mince se mohou generovat v dráze pily (možná záměr).
- Kvalita vykreslování (`QL`) se při zpomalení jen snižuje a nevrací.
- V `AN` (`js/data.js`) a `animal()` (`js/sprites.js`) zůstaly barvy a kreslení starých zvířecích postav (pig, fox, frog…). Pravděpodobně už nepoužité, před smazáním ověř, co z toho hra volá.

## Ne
- Nedělej velké přepisy a refaktoring bez dohody, pokud není výslovně zadaný.
- Neměň název ani tvar uložené hry bez migrace.
- Neodevzdávej nic, co jsi nespustil.
