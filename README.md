# Energy Dashboard

See projekt on energiaandmete haldamise süsteem, mis koosneb backendist (Node.js, Express) ja frontendist (React, Vite). Süsteem võimaldab energia hindade sünkroniseerimist, andmete importimist JSON failist ning andmete vaatamist ja kustutamist.

## Keskkonna seadistamine

### Vajalikud tööriistad
- **Node.js**: Versioon 18 või uuem (kontrolli `node --version`)
- **MySQL**: Andmebaasi server (versioon 8.0+ soovitatav)
- **npm**: Node.js paketihaldur (tuleb koos Node.js-ga)

### Versiooninõuded
- Node.js >= 18.0.0
- MySQL >= 8.0

### Sõltuvuste paigaldamine
1. Kloonige repositoorium ja navigeerige projekti juurkausta.
2. Paigaldage backend sõltuvused:
   ```bash
   cd backend
   npm install
   ```
3. Paigaldage frontend sõltuvused:
   ```bash
   cd ../frontend
   npm install
   ```

## Andmebaasi migratsioonide käivitamine

Projekti kasutab Sequelize ORM-i MySQL andmebaasiga. Migratsioonid loovad vajalikud tabelid.

1. Veenduge, et MySQL server töötab ja andmebaas `energy_dashboard` on loodud.
2. Navigeerige backend kausta:
   ```bash
   cd backend
   ```
3. Käivitage migratsioonid:
   ```bash
   npx sequelize-cli db:migrate
   ```

Kui migratsioonid õnnestuvad, luuakse `EnergyReadings` tabel.

## JSON-andmete importimine

Süsteem toetab energiaandmete importimist JSON failist.

1. Asetage JSON fail nimega `energy_dump.json` backend kausta.
2. JSON faili formaat peab olema järgmine:
   ```json
   [
     {
       "timestamp": "2023-01-01T00:00:00.000Z",
       "location": "EE",
       "price_eur_mwh": 45.67
     }
   ]
   ```
3. Käivitage import API kaudu:
   - Meetod: POST
   - URL: `http://localhost:3001/api/import/json`
   - Keha: tühi (fail loetakse automaatselt)

Import lisab andmed andmebaasi `source: "UPLOAD"` märgiga.

## Backend’i ja frontend’i käivitamine

### Backend käivitamine
1. Navigeerige backend kausta:
   ```bash
   cd backend
   ```
2. Käivitage server:
   ```bash
   node server.js
   ```
   Või arendusrežiimis nodemoniga:
   ```bash
   npx nodemon server.js
   ```
3. Backend töötab aadressil: `http://localhost:3001`

### Frontend käivitamine
1. Navigeerige frontend kausta:
   ```bash
   cd frontend
   ```
2. Käivitage arendusserver:
   ```bash
   npm run dev
   ```
3. Frontend töötab aadressil: `http://localhost:5173` (Vite vaikimisi port)

## Testide käivitamine

Projekti kasutab Jest testimisraamistikku.

1. Navigeerige backend kausta:
   ```bash
   cd backend
   ```
2. Käivitage testid:
   ```bash
   npm test
   ```

Testid hõlmavad ühikteste, integratsiooniteste ja teenuste teste.

## Lühike arhitektuuri kirjeldus

### Peamised komponendid
- **Backend**: Node.js Express server, mis haldab API endpoint'e, andmebaasi suhtlust ja äriloogikat.
- **Frontend**: React rakendus Vite ehitusvahendiga, mis pakub kasutajaliidest andmete vaatamiseks ja haldamiseks.
- **Andmebaas**: MySQL andmebaas energiaandmete salvestamiseks.

### Suhtlus
- Frontend suhtleb backendiga REST API kaudu (axios teek).
- Backend kasutab Sequelize ORM-i andmebaasi päringute tegemiseks.
- Andmed vahetatakse JSON formaadis.

### Kasutatavad tehnoloogiad
- **Backend**: Node.js, Express.js, Sequelize, MySQL, Jest
- **Frontend**: React, Vite, Axios
- **Tööriistad**: ESLint, Nodemon

## API sisemised endpoint’id

### Health Check
- **URL**: `/api/health`
- **Meetod**: GET
- **Kirjeldus**: Kontrollib serveri ja andmebaasi olekut.
- **Väljund**:
  ```json
  {
    "status": "ok",
    "db": "ok"
  }
  ```

### Andmete import
- **URL**: `/api/import/json`
- **Meetod**: POST
- **Kirjeldus**: Impordib andmed JSON failist andmebaasi.
- **Väljund**:
  ```json
  {
    "inserted": 100,
    "skipped": 5,
    "duplicates_detected": 0
  }
  ```

### Andmete hankimine
- **URL**: `/api/readings`
- **Meetod**: GET
- **Query parameetrid**:
  - `start`: Alguskuupäev (ISO 8601)
  - `end`: Lõpukuupäev (ISO 8601)
  - `location`: Asukoht (string või array)
- **Kirjeldus**: Tagastab energiaandmed määratud perioodi ja asukoha järgi.
- **Väljund**: Massiiv EnergyReading objektidest.

### Kokkuvõte
- **URL**: `/api/readings/summary`
- **Meetod**: GET
- **Kirjeldus**: Tagastab andmete kokkuvõtte (min/max kuupäevad, asukohad).
- **Väljund**:
  ```json
  {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-12-31T23:00:00.000Z",
    "locations": ["EE", "FI"]
  }
  ```

### Üleslaaditud andmete kustutamine
- **URL**: `/api/readings`
- **Meetod**: DELETE
- **Query parameetrid**: `source=UPLOAD`
- **Kirjeldus**: Kustutab üleslaaditud andmed (source: "UPLOAD").
- **Väljund**:
  ```json
  {
    "message": "Deleted 50 uploaded records."
  }
  ```

### Hindade sünkroniseerimine
- **URL**: `/api/sync/prices`
- **Meetod**: POST
- **Sisend**: Hindade andmed (JSON)
- **Kirjeldus**: Sünkroniseerib hindade andmed välisest API-st.
- **Väljund**: Sünkroniseerimise tulemus.

## Peamised sõltuvused ja nende eesmärk

### Backend sõltuvused
- **express**: Veebiserveri raamistik API endpoint'ide loomiseks.
- **sequelize**: ORM andmebaasi päringute lihtsustamiseks.
- **mysql2**: MySQL andmebaasi draiver.
- **cors**: CORS päiste haldus API päringute jaoks.
- **dotenv**: Keskkonnamuutujate laadimine.
- **axios**: HTTP kliendi välise API kutsete tegemiseks.

### Backend arendus sõltuvused
- **jest**: Testimisraamistik ühik- ja integratsioonitestide jaoks.
- **supertest**: API endpoint'ide testimise teek.
- **nodemon**: Arendusserveri automaatne taaskäivitamine failimuutustel.
- **sequelize-cli**: Andmebaasi migratsioonide ja seemnete haldus.

### Frontend sõltuvused
- **react**: Kasutajaliidese raamistik komponentide loomiseks.
- **react-dom**: React DOM manipuleerimine.
- **axios**: HTTP kliendi backend API kutsete tegemiseks.

### Frontend arendus sõltuvused
- **vite**: Kiire arendusserver ja ehitusvahend.
- **@vitejs/plugin-react**: React plugin Vite jaoks.
- **eslint**: Koodi kvaliteedi kontroll.
- **@types/react**: TypeScript tüübid React jaoks.</content>
<parameter name="filePath">/home/olha/oop2025-2026/tarkvaraprojekt/example-project/README.md