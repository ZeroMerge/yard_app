import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppMessagePayload {
  number: string;
  text: string;
}

@Injectable()
export class EvolutionApiProvider {
  private readonly logger = new Logger(EvolutionApiProvider.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly instanceName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('EVOLUTION_API_URL', 'http://localhost:8080');
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY', 'mock_key');
    this.instanceName = this.configService.get<string>('EVOLUTION_INSTANCE_NAME', 'yard_bot');
  }

  async sendTextMessage(payload: WhatsAppMessagePayload): Promise<boolean> {
    this.logger.log(`[EvolutionAPI] Sending message to ${payload.number}`);

    if (this.apiKey === 'mock_key' || this.apiUrl.includes('localhost')) {
      this.logger.debug(`[EvolutionAPI Mock Mode] Message: ${payload.text}`);
      return true;
    }

    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          number: payload.number,
          options: {
            delay: 1200,
            presence: 'composing',
            linkPreview: false
          },
          textMessage: {
            text: payload.text
          }
        }),
      });

      if (!response.ok) {
        this.logger.error(`Evolution API responded with status ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Evolution API request failed: ${error.message}`);
      // Graceful degradation: do not fail the overall process if WhatsApp fails
      return false;
    }
  }
}
