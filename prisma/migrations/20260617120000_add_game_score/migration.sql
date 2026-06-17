-- CreateTable
CREATE TABLE "game_score" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "best_score" INTEGER NOT NULL,
    "best_distance" INTEGER NOT NULL,
    "tire_id" TEXT NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_score_user_id_key" ON "game_score"("user_id");

-- CreateIndex
CREATE INDEX "game_score_best_score_idx" ON "game_score"("best_score");

-- AddForeignKey
ALTER TABLE "game_score" ADD CONSTRAINT "game_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

