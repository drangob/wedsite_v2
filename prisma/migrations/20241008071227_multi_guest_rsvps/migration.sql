-- AlterTable
ALTER TABLE "Rsvp" ADD COLUMN     "attendingGuestNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "nonAttendingGuestNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "guestNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
