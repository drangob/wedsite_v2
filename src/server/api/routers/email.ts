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
  to: z.array(z.string()),
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
          orderBy: { createdAt: "desc" },
        })
        .then((emails) =>
          emails.map((email) => ({
            ...email,
            to: email.to.map((to) => to.email),
            sent: email.sentAt !== null,
          })),
        ),
    );
  }),
  createEmail: adminProcedure.mutation(async () => {
    const a = await db.email.create({
      data: {
        from: process.env.MAILGUN_SENDER_EMAIL!,
        subject: "New email",
        body: "",
        to: {
          connect: [],
        },
      },
    });
    return a;
  }),
  deleteEmail: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.email.delete({
        where: {
          id: input.id,
        },
      });
      return { success: true };
    }),
  updateEmail: adminProcedure
    .input(
      z.object({
        id: z.string(),
        subject: z.string(),
        body: z.string(),
        to: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      await db.$transaction(async (prisma) => {
        // Remove all 'to' connections
        await prisma.email.update({
          where: {
            id: input.id,
          },
          data: {
            to: {
              set: [], // This will remove all connections
            },
          },
        });

        // Update with new 'to' connections
        await prisma.email.update({
          where: {
            id: input.id,
          },
          data: {
            to: {
              connect: input.to.map((email) => ({ email: email })),
            },
            subject: input.subject,
            body: input.body,
          },
        });
      });

      return { success: true };
    }),

  sendEmail: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Fetch all guest emails
      const email = await db.email.findUnique({
        where: {
          id: input.id,
        },
        select: {
          to: {
            select: {
              email: true,
            },
          },
          subject: true,
          body: true,
        },
      });

      if (!email) {
        throw new Error("Email not found");
      }

      if (email.to.length === 0) {
        throw new Error("No guest emails found");
      }

      const emails = email.to
        .map((to) => to.email)
        .filter((email) => email !== null);

      // Prepare email data
      const emailData: MailgunMessageData = {
        from: process.env.MAILGUN_SENDER_EMAIL ?? "",
        to: emails,
        subject: email.subject,
        html: email.body,
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
});
