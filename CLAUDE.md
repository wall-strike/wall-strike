# CLAUDE.md – pravidla pro práci na Wall Strike

Tento soubor čti na začátku každé práce v repozitáři. Je to krátký přehled projektu a pravidla, jak v něm psát a kódovat.

## Jak komunikovat
- S majitelem projektu piš **česky**, stručně a věcně. Nejdřív řekni, co jsi udělal, pak případné problémy.
- Kód, názvy proměnných, commity a texty ve hře (UI) jsou **anglicky**. Komentáře v kódu piš jen tam, kde není zřejmé *proč* něco děláš.
- Nic si nevymýšlej. Když něco nevíš nebo nemůžeš ověřit, řekni to. Nepiš, že něco funguje, pokud jsi to nespustil.
- Když je zadání nejasné, zvol rozumný výklad, řekni jaký a udělej to. Ptej se jen tehdy, když by špatný odhad znamenal velkou práci navíc.
- Nemaž ani nepřepisuj postup hráčů. Změny uložené hry musí být zpětně kompatibilní (viz Uložení).

## Co je tohle za projekt
Arkádová hra do prohlížeče (jedna stránka): hráč skáče mezi dvěma zdmi nahoru, sbírá mince, vyhýbá se překážkám a za mince si otevírá bedýnky (cases) s novými skiny. Běží na https://wallstrike.vercel.app/ a funguje jako PWA (offline).

Soubory:
- `index.html` – celá hra (CSS + JS), zhruba 55 KB, bez vložených obrázků. Čti ho po částech (`sed -n`, `grep -n`), nevypisuj celý.
- `assets/` – všechny obrázky, písmo a zvuk: `agents/`, `knives/`, `gloves/`, `ui/` (logo, coin, spike, crate, písmo `MojeRuka.ttf`, číslice `digits/`), `audio/`. Název souboru = klíč položky (např. `assets/agents/camo.png`).
- `sw.js` – service worker (cache). `manifest.webmanifest`, `icons/` (PWA ikony).
- Hra načítá obrázky ze souborů, takže ji spouštěj přes `http://localhost` (např. `python3 -m http.server`), ne z `file://` (canvas by byl kvůli `getImageData` zablokovaný).

## Důležité součásti kódu (v `index.html`)
- **Data položek:** tabulka `SKINS` (jeden řádek = jeden skin), z ní se skládají `ITEM`, `POOL`, `add()`, `DEF`, `AS`/`GI`/`KI` a barvy agentů v `AN`; rarity `RAR`; váhy dropu `WT`; vrácení za duplikát `REF`; bedýnky `CS`.
- **Agenti** (typ `a`): sprite v `AS`, barvy v `AN`. **Nože** (typ `k`): sprity v `KI`, finishe `FIN` (jeden řádek v `SKINS` se rozvine na všechny finishe). **Rukavice** (typ `g`): sprity v `GI`.
- **Kreslení:** `animal()`, `knife()`, `glove()`, `icon()`, `drw()`, `scene()`.
- **Herní logika:** `spawn()`, `coinsArc()`, `fixCoins()`, `upd()`, `pick()`, `pass()`, `end()`.
- **Uložení:** objekt `S` v `localStorage` pod klíčem `pigstrike` (starý název, **neměnit bez migrace**).

## Jak přidat nový skin
1. Sprite jako průhledné PNG (bílé pozadí pryč, oříznuté) do `assets/agents/`, `assets/gloves/` nebo `assets/knives/`. Agenti ~200 px široké, rukavice ~180, nože ~260 vodorovně **rukojeť vlevo, hrot vpravo**.
2. Přidat jeden řádek do `SKINS` (komentář nad tabulkou vysvětluje pole): `t` typ (`a`/`k`/`g`), `id`, `n` jméno, `r` rarita, `img` cesta pod `assets/`, `col` barvy (agent `{a,b,d}`, rukavice `[hlavní,tmavá]`). Výchozí položka: `def:1` (nepadá z bedýnek, dostanou ji i staří hráči), `eq:1` navíc znamená vybavená na čisté hře.
3. Přidat nový soubor do `FILES` v `sw.js` a zvýšit verzi cache `V`.
4. Zkontrolovat ve hře (inventář, bedýnky) a přepočítat ekonomiku bedýnek (viz Ekonomika).
Pozn.: `kimg()` má natvrdo výjimku pro nůž `karambit` (přebarvení finishe Default). Nový nůž ji nemá.

## Pravidla pro kód
- Žádné nové knihovny ani build krok bez schválení. Hra je záměrně prostý HTML/JS/CSS.
- Drž se stávajícího stylu (krátké názvy, `const`/`let`, canvas 720×1280). Nepřeformátovávej celé soubory, zbytečné změny dělají diff nečitelným.
- Změnu dělej co nejmenší a cílenou. Neopravuj „při té příležitosti“ nesouvisející věci, jen je navrhni.
- Před přepsáním textu v `index.html` ověř, že hledaný řetězec je v souboru právě jednou. Při úpravě skriptem použij kontrolu počtu výskytů.
- Žádné neošetřené `localStorage`/`JSON.parse`, vždy `try/catch`.
- Po změně obrázků nebo souborů v cache zvyš verzi v `sw.js` (`wall-strike-vN`, teď v8) a nový soubor přidej do `FILES`.

## Uložení (localStorage)
- Nikdy nezahazuj uloženou hru. Nové položky a výchozí výbavu přidávej tak, aby to fungovalo i se starým uložením (viz kontrolní řádky pod definicí `ITEM`).
- Pokud změníš tvar `S`, přidej migraci. Změna klíče `pigstrike` bez migrace hráčům smaže postup.
- Nákup bedýnky zapisuje `S.pend` hned po losování, aby se při obnovení stránky neztratily peníze ani předmět. Tohle chování nerozbij.

## Ekonomika (neměň bez dohody, hlídej poměry)
- Ceny bedýnek: Agent 380, Knife 260, Gloves 320. Vrácení za duplikát (`REF`) musí být **vždy hluboko pod cenou bedýnky**, jinak vznikne nekonečné vydělávání. Po každé změně položek nebo `REF` spočítej průměrné vrácení pro každou bedýnku a ověř, že je výrazně nižší než její cena.
- Příjem: hodnota mince = `1` (zlatá `8`) × násobič kombo × násobič mapy. Bonus na konci runu 1,5 % skóre × mapa.
- Do bedýnky nikdy nedávej jedinou položku (po prvním otevření je vždy duplikát).

## Jak ověřovat změny
Změnu vždy spusť, nestačí kód přečíst. Headless prohlížeč je dostupný přes Playwright (Chromium). Doporučené kontroly:
- Hra naběhne bez chyb v konzoli (`pageerror`) a bez 404 (service worker se musí zaregistrovat; k tomu spusť z `http://localhost`, ne z `file://`).
- Menu, inventář (všechny tři záložky), bedýnky a spuštěný běh se vykreslí správně; udělej screenshot a prohlédni si ho.
- Mince se nikdy nevygenerují uvnitř bloku (spusť `spawn()` několik tisíckrát).
- Ekonomika bedýnek (vrácení vs. cena), přerušené otevření bedýnky (obnovení stránky), staré uložení po aktualizaci.

## Známé problémy (nevydávej za opravené)
- Výběr mapy v menu Maps nemá vliv na hru: `S.map` se při startu i v `newRun()` nastaví na 0 a mapa se mění jen podle skóre.
- Mince se mohou generovat v dráze pily (možná záměr).
- Gloves Case obsahuje jedinou položku (Vice).
- Kvalita vykreslování (`QL`) se při zpomalení jen snižuje a nevrací.
- README i komentář ve stylu pořád říkají PIG_STRIKE (starý název).

## Ne
- Nedělej velké přepisy a refaktoring bez dohody, pokud není výslovně zadaný.
- Neposílej ani necatuj celý `index.html` (čti ho po částech).
- Neměň název ani tvar uložené hry bez migrace.
- Neodevzdávej nic, co jsi nespustil.
