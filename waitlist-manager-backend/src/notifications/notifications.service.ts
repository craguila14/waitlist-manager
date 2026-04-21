import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly twilioClient: twilio.Twilio | null = null;
  private readonly fromPhone: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken && accountSid !== 'ACxxxxxxxxxxxxxxxx') {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio inicializado — SMS reales activados');
    } else {
      this.logger.warn('Twilio no configurado — modo mock activado (SMS se loguean en consola)');
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    if (!this.twilioClient || !this.fromPhone) {
      this.logger.log(`[MOCK SMS] Para: ${to} | Mensaje: ${message}`);
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to,
      });
      this.logger.log(`SMS enviado a ${to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error enviando SMS a ${to}: ${message}`);
    }
  }

  getCalledMessage(guestName: string, restaurantName: string): string {
    return `Hola ${guestName}, tu mesa en ${restaurantName} está lista. Tienes 5 minutos para llegar. ¡Te esperamos!`;
  }
}