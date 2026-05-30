import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateHeadlineDto } from './dto/generate-headline.dto';
import { HeadlineController } from './headline.controller';
import { HeadlineService } from './headline.service';
import { ConfigService } from '../config/config.service';

describe('GenerateHeadlineDto validation', () => {
  it('should reject count > 10', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: 'test',
      count: 99999,
    });
    const errors = await validate(dto);
    const countError = errors.find((e) => e.property === 'count');
    expect(countError).toBeDefined();
  });

  it('should reject count < 1', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: 'test',
      count: 0,
    });
    const errors = await validate(dto);
    const countError = errors.find((e) => e.property === 'count');
    expect(countError).toBeDefined();
  });

  it('should reject non-integer count', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: 'test',
      count: 3.5,
    });
    const errors = await validate(dto);
    const countError = errors.find((e) => e.property === 'count');
    expect(countError).toBeDefined();
  });

  it('should accept valid count', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: 'test topic',
      count: 5,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept missing count (defaults to 5)', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: 'test topic',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject empty topic', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: '',
    });
    const errors = await validate(dto);
    const topicError = errors.find((e) => e.property === 'topic');
    expect(topicError).toBeDefined();
  });

  it('should reject invalid platform', async () => {
    const dto = plainToInstance(GenerateHeadlineDto, {
      topic: 'test',
      platform: 'invalid-platform',
    });
    const errors = await validate(dto);
    const platformError = errors.find((e) => e.property === 'platform');
    expect(platformError).toBeDefined();
  });
});

describe('HeadlineController', () => {
  let controller: HeadlineController;

  beforeEach(() => {
    const mockConfigService = {
      openaiApiKey: '',
    } as unknown as ConfigService;
    const service = new HeadlineService(mockConfigService);
    controller = new HeadlineController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('healthCheck should return ok', () => {
    const result = controller.healthCheck();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
