import { BadRequestException } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { ConfigService } from '../config/config.service';

describe('VoiceService', () => {
  let service: VoiceService;

  beforeEach(() => {
    const mockConfigService = {
      minimaxApiKey: '',
    } as unknown as ConfigService;
    service = new VoiceService(mockConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException when MiniMax API key is not configured', async () => {
    await expect(
      service.uploadAudioFile(Buffer.from('test'), 'test.mp3'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for cloneVoice without API key', async () => {
    await expect(service.cloneVoice('file-id', 'voice-name')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException for generateSpeech without API key', async () => {
    await expect(service.generateSpeech('hello', 'voice-id')).rejects.toThrow(
      BadRequestException,
    );
  });
});
