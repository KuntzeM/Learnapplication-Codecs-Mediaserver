# Medienprojekt - TU Ilmenau
### Media Server
**Lernanwendung: Gegenüberstellung verschiedener Bild- und Videoformate**

Julia Peter & Mathias Kuntze

Betreuer: Dipl.-Inf. Thomas Köllmer

Professor: Prof. Karlheinz Brandenburg


#### Probleme bei der Installation?
Sollte bei der Installation etwas nicht funktionieren z.B. ein Fehler bei der Installation der Abhängigkeiten auftreten, dann schreibe bitte ein Issue hier in github. Wir werden uns zeitnah um das Problem kümmern.

### Benötigte Software

* nodejs v6.9.2 include npm 3.10.9
https://nodejs.org/en/download/
```
sudo apt-get install nodejs npm
```

* ffmpeg
http://ffmpeg.org/download.html
```
sudo apt-get install ffmpeg
```
* imagemagick
http://www.imagemagick.org/script/binary-releases.php
```
sudo apt-get install imagemagick
```

### Installation

1 Media-Applikation downloaden

`git clone https://github.com/KuntzeM/Medienprojekt-MediaServer.git`

2 Einstellungen in config.json ändern
- api-key: zufällige längere Zeichenkette -> dient zur Authentifikation des Web-Servers
- Key muss im Webserver bei Configuration zusammen mit der IP des Media-Servers angegeben werden
```
{
  "mysql": {
    "host": "localhost",
    "user": "database_username",
    "pass": "database_password",
    "database": "database_name",
    "prefix": "medienprojekt_"
  },
  "api": {
    "key": random_key
  },
  "storage": {
    "path": "storage"
  }


}
```

3 fehlende Abhängigkeiten per Konsole installieren
```
npm update
```

4 Server starten
```
node bin/www
```

5 Media-Server müssten nun laufen. IP Adresse und Key müssen in der Webapplikation unter Configuration eingetragen werden.
