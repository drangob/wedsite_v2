-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EmailToUser_AB_unique" ON "_EmailToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EmailToUser_B_index" ON "_EmailToUser"("B");

-- AddForeignKey
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToUser" ADD CONSTRAINT "_EmailToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
