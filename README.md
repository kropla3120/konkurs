# WMGuessr - gra zainspirowana popularnym GeoGuessr'em.

Gracz po wejściu do gry dostaje widok StreetView 5 losowych lokalizacji znajdujących się w Warmi i Mazurach o tematyce wybranego trybu gry. Celem gracza jest odgadnięcie po samym Streetview w jakiej lokalizacji się znajduje, im bliżej trafi tym większa ilość punktów. Maksimum punktów za każdą lokalizację to 1000, za całą rozgrywkę 5000.

Gra jest zahostowana pod adresem

# [https://wmguessr.web.app](https://wmguessr.web.app)

Aby włączyć grę w trybie dewloperskim wymagana jest instalacja NodeJS 1.16^ na komputerze.
Po pobraniu repo należy wykonać komendę w cmd aby pobrać wymagane biblioteki:

### `npm install`

Po zainstalowaniu, aby włączyć lokalny serwer dewloperski należy wykonać:

### `npm start`

Serwer po włączeniu jest dostępny pod adresem `localhost:3000`

Aby zbudować grę do stanu produkcyjnego należy wykonać:

### `npm build`

Po wykonaniu pliki strony znajdą sie w katalogu `/build`
