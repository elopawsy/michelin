-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bicycle_brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "bicycle_type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "bicycle_model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brand_id" INTEGER NOT NULL,
    "bicycle_type_id" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "bicycle_model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "bicycle_brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bicycle_model_bicycle_type_id_fkey" FOREIGN KEY ("bicycle_type_id") REFERENCES "bicycle_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_bicycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "bicycle_model_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "wheel_size" TEXT NOT NULL,
    "tire_width_mm" INTEGER NOT NULL,
    "brake_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_bicycle_bicycle_model_id_fkey" FOREIGN KEY ("bicycle_model_id") REFERENCES "bicycle_model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_bicycle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "road_surface" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "user_preference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "goal_id" INTEGER NOT NULL,
    "road_surface_id" INTEGER NOT NULL,
    "weekly_distance_km" REAL NOT NULL,
    "priority_speed" INTEGER NOT NULL,
    "priority_comfort" INTEGER NOT NULL,
    "priority_durability" INTEGER NOT NULL,
    CONSTRAINT "user_preference_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_preference_road_surface_id_fkey" FOREIGN KEY ("road_surface_id") REFERENCES "road_surface" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "esp_device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_bicycle_id" INTEGER NOT NULL,
    "serial_number" TEXT NOT NULL,
    "firmware_version" TEXT NOT NULL,
    "battery_percent" INTEGER NOT NULL,
    "last_seen_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "esp_device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "esp_device_user_bicycle_id_fkey" FOREIGN KEY ("user_bicycle_id") REFERENCES "user_bicycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wheel_sensor_reading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "esp_device_id" INTEGER NOT NULL,
    "user_bicycle_id" INTEGER NOT NULL,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pressure_bar" REAL NOT NULL,
    "wear_percent" REAL NOT NULL,
    "speed_kmh" REAL NOT NULL,
    "tire_temp_c" REAL NOT NULL,
    "ambient_temp_c" REAL NOT NULL,
    "distance_km" REAL NOT NULL,
    "remaining_km" REAL NOT NULL,
    "rolling_resistance" REAL NOT NULL,
    "road_surface_id" INTEGER,
    "battery_percent" INTEGER NOT NULL,
    CONSTRAINT "wheel_sensor_reading_esp_device_id_fkey" FOREIGN KEY ("esp_device_id") REFERENCES "esp_device" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wheel_sensor_reading_road_surface_id_fkey" FOREIGN KEY ("road_surface_id") REFERENCES "road_surface" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "wheel_sensor_reading_user_bicycle_id_fkey" FOREIGN KEY ("user_bicycle_id") REFERENCES "user_bicycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wheel_type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "wheel_size" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "wheel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wheel_type_id" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT,
    "durability_km" INTEGER NOT NULL,
    "min_tire_width_mm" INTEGER NOT NULL,
    "max_tire_width_mm" INTEGER NOT NULL,
    "weight_g" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "tubeless_ready" BOOLEAN NOT NULL DEFAULT false,
    "brake_type" TEXT NOT NULL,
    "rolling_resistance_score" INTEGER NOT NULL,
    "comfort_score" INTEGER NOT NULL,
    "speed_score" INTEGER NOT NULL,
    "durability_score" INTEGER NOT NULL,
    CONSTRAINT "wheel_wheel_type_id_fkey" FOREIGN KEY ("wheel_type_id") REFERENCES "wheel_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wheel_road_surface" (
    "wheel_id" INTEGER NOT NULL,
    "road_surface_id" INTEGER NOT NULL,

    PRIMARY KEY ("wheel_id", "road_surface_id"),
    CONSTRAINT "wheel_road_surface_road_surface_id_fkey" FOREIGN KEY ("road_surface_id") REFERENCES "road_surface" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wheel_road_surface_wheel_id_fkey" FOREIGN KEY ("wheel_id") REFERENCES "wheel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wheel_goal" (
    "wheel_id" INTEGER NOT NULL,
    "goal_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,

    PRIMARY KEY ("wheel_id", "goal_id"),
    CONSTRAINT "wheel_goal_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wheel_goal_wheel_id_fkey" FOREIGN KEY ("wheel_id") REFERENCES "wheel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wheel_bicycle_type" (
    "wheel_id" INTEGER NOT NULL,
    "bicycle_type_id" INTEGER NOT NULL,

    PRIMARY KEY ("wheel_id", "bicycle_type_id"),
    CONSTRAINT "wheel_bicycle_type_bicycle_type_id_fkey" FOREIGN KEY ("bicycle_type_id") REFERENCES "bicycle_type" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wheel_bicycle_type_wheel_id_fkey" FOREIGN KEY ("wheel_id") REFERENCES "wheel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wheel_recommendation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_bicycle_id" INTEGER NOT NULL,
    "wheel_id" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wheel_recommendation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wheel_recommendation_user_bicycle_id_fkey" FOREIGN KEY ("user_bicycle_id") REFERENCES "user_bicycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wheel_recommendation_wheel_id_fkey" FOREIGN KEY ("wheel_id") REFERENCES "wheel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bicycle_brand_name_key" ON "bicycle_brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bicycle_type_title_key" ON "bicycle_type"("title");

-- CreateIndex
CREATE INDEX "bicycle_model_bicycle_type_id_idx" ON "bicycle_model"("bicycle_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "bicycle_model_brand_id_bicycle_type_id_model_key" ON "bicycle_model"("brand_id", "bicycle_type_id", "model");

-- CreateIndex
CREATE INDEX "user_bicycle_bicycle_model_id_idx" ON "user_bicycle"("bicycle_model_id");

-- CreateIndex
CREATE INDEX "user_bicycle_user_id_idx" ON "user_bicycle"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "goal_title_key" ON "goal"("title");

-- CreateIndex
CREATE UNIQUE INDEX "road_surface_title_key" ON "road_surface"("title");

-- CreateIndex
CREATE INDEX "user_preference_goal_id_idx" ON "user_preference"("goal_id");

-- CreateIndex
CREATE INDEX "user_preference_road_surface_id_idx" ON "user_preference"("road_surface_id");

-- CreateIndex
CREATE INDEX "user_preference_user_id_idx" ON "user_preference"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "esp_device_serial_number_key" ON "esp_device"("serial_number");

-- CreateIndex
CREATE INDEX "esp_device_user_bicycle_id_idx" ON "esp_device"("user_bicycle_id");

-- CreateIndex
CREATE INDEX "esp_device_user_id_idx" ON "esp_device"("user_id");

-- CreateIndex
CREATE INDEX "wheel_sensor_reading_esp_device_id_recorded_at_idx" ON "wheel_sensor_reading"("esp_device_id", "recorded_at");

-- CreateIndex
CREATE INDEX "wheel_sensor_reading_road_surface_id_idx" ON "wheel_sensor_reading"("road_surface_id");

-- CreateIndex
CREATE INDEX "wheel_sensor_reading_user_bicycle_id_idx" ON "wheel_sensor_reading"("user_bicycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "wheel_type_title_wheel_size_key" ON "wheel_type"("title", "wheel_size");

-- CreateIndex
CREATE UNIQUE INDEX "wheel_wheel_type_id_model_key" ON "wheel"("wheel_type_id", "model");

-- CreateIndex
CREATE INDEX "wheel_road_surface_road_surface_id_idx" ON "wheel_road_surface"("road_surface_id");

-- CreateIndex
CREATE INDEX "wheel_goal_goal_id_idx" ON "wheel_goal"("goal_id");

-- CreateIndex
CREATE INDEX "wheel_bicycle_type_bicycle_type_id_idx" ON "wheel_bicycle_type"("bicycle_type_id");

-- CreateIndex
CREATE INDEX "wheel_recommendation_user_bicycle_id_idx" ON "wheel_recommendation"("user_bicycle_id");

-- CreateIndex
CREATE INDEX "wheel_recommendation_user_id_idx" ON "wheel_recommendation"("user_id");

-- CreateIndex
CREATE INDEX "wheel_recommendation_wheel_id_idx" ON "wheel_recommendation"("wheel_id");
