import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import formData from "form-data";
import Mailgun, { type MailgunMessageData } from "mailgun.js";
import { GuestSchema } from "./user";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY ?? "dummy_key",
  url: "https://api.eu.mailgun.net",
});
const SendEmailInput = z.object({
  subject: z.string(),
  body: z.string(),
});

const EmailSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.array(GuestSchema),
  subject: z.string(),
  body: z.string(),
  sent: z.boolean(),
  sentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const emailRouter = createTRPCRouter({
  sendEmailToAllGuests: adminProcedure
    .input(SendEmailInput)
    .mutation(async ({ input }) => {
      // Fetch all guest emails
      const guests = await db.user.findMany({
        select: {
          email: true,
        },
      });

      const emails = guests.map((guest) => guest.email).filter(Boolean);

      if (emails.length === 0) {
        throw new Error("No guest emails found");
      }

      // Prepare email data
      const emailData: MailgunMessageData = {
        from: process.env.MAILGUN_SENDER_EMAIL ?? "",
        to: emails as string[],
        subject: input.subject,
        html: input.body,
      };

      // Send email using Mailgun
      try {
        const result = await mg.messages.create(
          process.env.MAILGUN_DOMAIN ?? "",
          emailData,
        );
        return { success: true, messageId: result.id };
      } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
      }
    }),
  getAllEmails: adminProcedure.query(async () => {
    return EmailSchema.array().parseAsync(
      await db.email
        .findMany({
          select: {
            id: true,
            from: true,
            to: true,
            subject: true,
            body: true,
            sentAt: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        .then((emails) =>
          emails.map((email) => ({
            ...email,
            sent: email.sentAt !== null,
          })),
        ),
    );
  }),
});
