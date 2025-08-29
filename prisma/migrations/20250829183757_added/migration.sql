-- CreateTable
CREATE TABLE "public"."Balance" (
    "id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Balance" ADD CONSTRAINT "Balance_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
