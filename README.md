# SkyLog

**Topic:** Airlines — a mobile app for keeping airline records (create, view, edit, delete), with live weather at each airline's hub city.

## Stack

- **Backend:** plain PHP 8 + MySQL (PDO), served by XAMPP Apache
- **Mobile:** Expo React Native (TypeScript), React Navigation native stack, runs in Expo Go
- **Third-party API:** Open-Meteo (no key)

## Third-Party API

Open-Meteo — https://open-meteo.com/

| Purpose | Endpoint |
|---|---|
| Geocode the hub city | `https://geocoding-api.open-meteo.com/v1/search?name={hub_city}&count=1` |
| Current weather | `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto` |

The `weather_code` is turned into text using the WMO weather code table.

## Custom API

Base URL: `http://<laptop-ip>/skylog-airlines/backend/api/airlines.php`

| Method | URL | Body | Success | Errors |
|---|---|---|---|---|
| GET | `airlines.php` | — | 200 list (newest first) | — |
| GET | `airlines.php?id=1` | — | 200 record | 404 |
| POST | `airlines.php` | JSON airline | 201 created record | 400, 409 |
| PUT | `airlines.php?id=1` | JSON airline (all fields) | 200 updated record | 400, 404, 409 |
| DELETE | `airlines.php?id=1` | — | 200 `{"deleted":true}` | 404 |

Airline JSON fields: `name`, `iata_code` (2 letters/digits), `icao_code` (3 letters), `country`, `hub_airport` (3 letters), `hub_city`, `founded_year` (1900–current year), `status` (`Active`/`Inactive`), `website` (optional http(s) URL).

Validation errors return `400 {"errors": {"field": "message"}}`. A duplicate IATA or ICAO code returns `409`.

## Setup

### 1. XAMPP

1. Install XAMPP to `C:\xampp`.
2. Put this project at `C:\xampp\htdocs\skylog-airlines` (copy it there, or link it: `mklink /J C:\xampp\htdocs\skylog-airlines D:\SKYLOG`).
3. Open the XAMPP Control Panel and press **Start** for **Apache** and **MySQL**.

### 2. Database

```
C:\xampp\mysql\bin\mysql.exe -u root < backend\database.sql
```

This creates the `skylog` database, the `airlines` table, and 3 sample airlines. Database settings are in `backend/config.php` (XAMPP defaults: `127.0.0.1`, `root`, no password).

Check it: open http://localhost/skylog-airlines/backend/api/airlines.php in a browser.

### 3. Mobile

1. Find your laptop's Wi-Fi IPv4 with `ipconfig` and put it in `mobile/src/config.ts`.
2. Install and start:
   ```
   cd mobile
   npm install
   npx expo start
   ```
3. Install **Expo Go** on your phone, connect it to the same Wi-Fi, and scan the QR code.

If the phone can't reach the API, allow Apache (`httpd.exe`) through Windows Firewall on Private networks.
