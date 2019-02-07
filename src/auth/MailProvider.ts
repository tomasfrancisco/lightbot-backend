import { isNil } from "lodash";
import * as mailgun from "mailgun-js";
import { logger } from "~/logger";

export interface MailProvider {
  sendEmail(receiver: string, subject: string, message: string): Promise<any>;
}

class MailgunMailProvider implements MailProvider {
  public static getInstance(): MailProvider {
    const api = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (isNil(api) || isNil(domain)) {
      throw new Error("Can't initiate default MailProvider");
    } else {
      return new MailgunMailProvider(api, domain);
    }
  }

  private readonly mg: mailgun.Mailgun;

  private constructor(private readonly apiKey: string, private readonly domain: string) {
    this.mg = mailgun({
      apiKey: this.apiKey,
      domain: this.domain,
    });
  }

  public async sendEmail(
    receiver: string,
    subject: string,
    message: string,
  ): Promise<mailgun.messages.SendResponse> {
    const mgData = {
      from: process.env.FROM_EMAIL,
      to: receiver,
      subject,
      text: message,
    };

    return this.mg.messages().send(mgData);
  }
}

export class Mailer {
  public mailProvider: MailProvider;

  public constructor(provider?: MailProvider) {
    this.mailProvider = provider ? provider : MailgunMailProvider.getInstance();
  }

  public async sendAccountActivate(email: string, resetToken: string): Promise<any> {
    logger.log(email, resetToken);

    return this.mailProvider.sendEmail(
      email,
      "Lightbot activation",
      `
Hello,

Please open the following url to verify your email:
${process.env.EDITOR_URL}/auth/verify?token=${resetToken}

Thank you!
    `,
    );
  }

  public async sendPasswordResetMail(email: string, resetToken: string): Promise<any> {
    logger.log(email, resetToken);

    return this.mailProvider.sendEmail(
      email,
      "Lightbot password reset.",
      `
Hello,

Please open the following url to change your password:
${process.env.EDITOR_URL}/auth/verify?token=${resetToken}

Thank you!
    `,
    );
  }
}
