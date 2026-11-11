# WALL STRIKE

Arkádová hra do prohlížeče: skáčeš mezi dvěma zdmi nahoru, sbíráš mince, vyhýbáš se bodcům, blokům a pilám a za mince otevíráš bedýnky (cases) s novými skiny agentů, nožů a rukavic. Hra je jedna stránka, funguje na mobilu i na PC a jako PWA i offline.

**Hrát:** https://wallstrike.vercel.app/

## Ovládání

| Akce | Mobil | PC |
|---|---|---|
| Dlouhý skok na protější zeď | klepnutí na protější půlku obrazovky | `A` / `D` nebo šipky |
| Hop na vlastní zdi | klepnutí na vlastní stranu | `A` / `D` nebo šipky |
| Dvojitý skok | klepnutí ve vzduchu | `Space` / `W` ve vzduchu |
| Pauza | tlačítko vpravo nahoře | `P` |
| Ukončit běh | – | `Esc` |
| Celá obrazovka | Nastavení | `F` nebo Nastavení |

Štít (sběratelný předmět) tě jednou zachrání. Kombo násobí výdělek z mincí a mapy se odemykají podle skóre.

## Spuštění lokálně

Hra načítá obrázky a zvuk ze souborů, takže ji nespouštěj dvojklikem (`file://`), ale přes lokální server:

```
python3 -m http.server 8000
```

a otevři `http://localhost:8000`. Service worker (offline režim) se registruje jen přes `http(s)`.

## Struktura

```
index.html              kostra stránky (načítá css/ a js/)
css/style.css           styly hry
js/game.js              celá herní logika a data (tabulka SKINS)
sw.js                   service worker (cache, offline) – musí zůstat v kořeni
manifest.webmanifest    PWA manifest
assets/
  agents/ knives/ gloves/   sprity skinů (název souboru = klíč položky)
  ui/                       logo, mince, bodce, bedýnka
  digits/                   číslice
  fonts/                    písmo MojeRuka.ttf
  icons/                    PWA ikony a favicon
  audio/                    zvuk otevření bedýnky
CLAUDE.md               pravidla a přehled pro práci na projektu
```

## Přidání nového skinu

1. Přidej průhledné PNG do `assets/agents/`, `assets/gloves/` nebo `assets/knives/` (agenti ~200 px široké, rukavice ~180 px, nože ~260 px vodorovně, rukojeť vlevo, hrot vpravo).
2. Přidej jeden řádek do tabulky `SKINS` v `js/game.js` (typ, id, jméno, rarita, cesta k obrázku, barvy).
3. Přidej nový soubor do `FILES` v `sw.js` a zvyš verzi cache `V`.

Podrobnosti a pravidla ekonomiky bedýnek jsou v `CLAUDE.md`.

## Uložení hry

Postup se ukládá do `localStorage` pod klíčem `pigstrike` (starý název hry, neměnit bez migrace). Při načtení se uložení ověřuje a poškozený záznam se zazálohuje do `pigstrike_bak`. Nákup bedýnky se zapisuje hned po losování, takže se při obnovení stránky neztratí peníze ani předmět.

## Nasazení

Statický web, bez build kroku. Hostuje se na Vercelu; stačí nahrát soubory do větve `main`.
