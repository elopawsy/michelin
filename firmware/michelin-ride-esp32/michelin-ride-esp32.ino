/*
 * Michelin Ride — capteur de pneu connecté (ESP32)
 * ----------------------------------------------------
 * Expose en BLE les données des deux pneus d'un vélo et les envoie en
 * NOTIFY à l'application web (page /pneu, Web Bluetooth).
 *
 * Contrat partagé avec app/pneu/page.tsx (à garder synchronisé) :
 *   - Service  UUID : 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 *   - Charact. UUID : beb5483e-36e1-4688-b7f5-ea07361b26a8  (NOTIFY)
 *   - Trame JSON  : {"pf":2.41,"pr":2.38,"wf":12,"wr":18,"v":31.4,"d":1280,"bat":87}
 *       pf  pression avant   (bar,  2 décimales)
 *       pr  pression arrière (bar,  2 décimales)
 *       wf  usure avant      (%,    entier)
 *       wr  usure arrière    (%,    entier)
 *       v   vitesse          (km/h, 1 décimale)
 *       d   distance/odo     (km,   entier)
 *       bat batterie         (%,    entier)
 *
 * Carte : n'importe quel ESP32 (BLE). IDE Arduino + core "esp32" (Espressif).
 * Sélectionner la bonne carte dans Outils > Type de carte, puis Téléverser.
 *
 * NOTE : ce sketch SIMULE les données pour valider la connexion de bout en
 * bout. Les blocs marqués « CAPTEUR RÉEL » indiquent où lire vos vrais
 * capteurs (pression, hall/vitesse, jauge batterie…).
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// --- Doit correspondre EXACTEMENT aux constantes de app/pneu/page.tsx ---
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHAR_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define DEVICE_NAME  "Michelin Ride"

// Cadence d'envoi des trames (ms).
static const uint32_t INTERVAL_MS = 1000;

BLECharacteristic *pCharacteristic = nullptr;
bool deviceConnected = false;
bool advertiseAgain = false;  // redémarrage de l'annonce après déconnexion

// --- État simulé du vélo (remplacer par de vraies lectures capteurs) ---
float pressionAvant = 2.40f;   // bar
float pressionArriere = 2.35f; // bar
float usureAvant = 9.0f;       // %
float usureArriere = 14.0f;    // %
float vitesse = 0.0f;          // km/h
float distanceKm = 1250.0f;    // km (odomètre)
float batterie = 92.0f;        // %

// Callbacks de connexion : on garde l'appareil visible pour la prochaine
// connexion en relançant l'annonce dès qu'un client se déconnecte.
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    deviceConnected = true;
    Serial.println("Client connecté.");
  }
  void onDisconnect(BLEServer *pServer) override {
    deviceConnected = false;
    advertiseAgain = true;
    Serial.println("Client déconnecté — relance de l'annonce.");
  }
};

void setup() {
  Serial.begin(115200);
  randomSeed(esp_random());

  BLEDevice::init(DEVICE_NAME);

  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
      CHAR_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  // CCCD (0x2902) : indispensable pour que le navigateur puisse s'abonner.
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  // L'UUID du service doit figurer dans l'annonce, sinon le filtre
  // Web Bluetooth `filters:[{services:[SERVICE]}]` ne trouvera pas l'appareil.
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BLE prêt — annonce de \"" DEVICE_NAME "\".");
}

void majMesures() {
  // ====================== CAPTEUR RÉEL ======================
  // Remplacez les lignes ci-dessous par vos lectures réelles, ex. :
  //   pressionAvant = lirePressionBar(PIN_CAPTEUR_AVANT);
  //   vitesse       = vitesseDepuisHall();
  //   batterie      = niveauBatterie();
  // ==========================================================

  // --- Simulation : pressions qui respirent autour d'une cible ---
  pressionAvant += (random(-4, 5) / 1000.0f);
  pressionArriere += (random(-4, 5) / 1000.0f);
  pressionAvant = constrain(pressionAvant, 2.10f, 2.70f);
  pressionArriere = constrain(pressionArriere, 2.10f, 2.70f);

  // --- Vitesse : balade qui accélère/ralentit ---
  vitesse += (random(-30, 31) / 10.0f);
  vitesse = constrain(vitesse, 0.0f, 42.0f);

  // --- Distance : odomètre alimenté par la vitesse ---
  distanceKm += vitesse * (INTERVAL_MS / 1000.0f) / 3600.0f;

  // --- Usure : progresse très lentement avec les kilomètres ---
  usureAvant += 0.002f;
  usureArriere += 0.003f;
  usureAvant = constrain(usureAvant, 0.0f, 100.0f);
  usureArriere = constrain(usureArriere, 0.0f, 100.0f);

  // --- Batterie : décharge lente ---
  batterie -= 0.01f;
  batterie = constrain(batterie, 0.0f, 100.0f);
}

void loop() {
  // Relance l'annonce après une déconnexion (laisse à la pile le temps
  // de libérer la connexion précédente).
  if (advertiseAgain) {
    advertiseAgain = false;
    delay(500);
    BLEDevice::startAdvertising();
  }

  majMesures();

  if (deviceConnected && pCharacteristic != nullptr) {
    char json[160];
    snprintf(json, sizeof(json),
             "{\"pf\":%.2f,\"pr\":%.2f,\"wf\":%d,\"wr\":%d,\"v\":%.1f,\"d\":%d,\"bat\":%d}",
             pressionAvant, pressionArriere,
             (int)usureAvant, (int)usureArriere,
             vitesse, (int)distanceKm, (int)batterie);

    pCharacteristic->setValue((uint8_t *)json, strlen(json));
    pCharacteristic->notify();
    Serial.println(json);
  }

  delay(INTERVAL_MS);
}
