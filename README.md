# Medienprojekt - TU Ilmenau
### Media Server
**Lernanwendung: Gegenüberstellung verschiedener Bild- und Videoformate**

Julia Peter & Mathias Kuntze

Betreuer: Dipl.-Inf. Thomas Köllmer

Professor: Prof. Karlheinz Brandenburg


#### Probleme bei der Installation?
Sollte bei der Installation entwas nicht funktionieren z.B. ein Fehler bei der Installation der Abhängigkeiten auftreten, dann schreibe bitte ein Issue hier in github. Wir werden uns zeitnah um das Problem kümmern.


### Installation

1 Web-Applikation downloaden

`git clone https://github.com/KuntzeM/Medienprojekt-WebServer.git`

2 Einstellungen in config.env ändern
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