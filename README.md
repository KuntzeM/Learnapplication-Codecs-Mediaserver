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

In der Version 6.* befindet sich ein Bug, der das Bild nicht korrekt in JPEG2000 codiert. In der Version 7 ist der Bug beseitigt

Anleitung: http://www.imagemagick.org/script/install-source.php
```
sudo apt-get install libopenjpeg5* libopenjp2-* libpng16-* libjpeg9*
wget https://www.imagemagick.org/download/ImageMagick.tar.gz
tar xvzf ImageMagick-7.0.4.tar.gz
cd ImageMagick-7.0.4
./configure --enable-shared --with-jpeg --with-openjp2 --with-png
sudo make
sudo make install
sudo ldconfig /usr/local/lib

```

### Installation

1 Media-Applikation downloaden

`git clone https://github.com/KuntzeM/Medienprojekt-MediaServer.git`

2 Einstellungen in config.json ändern
- api-key: zufällige längere Zeichenkette -> dient zur Authentifikation des Web-Servers
- Key muss im Webserver bei Configuration zusammen mit der IP des Media-Servers angegeben werden
```
{
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
