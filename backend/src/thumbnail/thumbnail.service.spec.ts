import { HttpException } from '@nestjs/common';
import { ThumbnailService } from './thumbnail.service';

describe('ThumbnailService', () => {
  let service: ThumbnailService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ThumbnailService();
    // Mock global fetch to prevent live API calls in tests
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('fetch not mocked for this test'));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('YouTube', () => {
    it('should extract thumbnails from standard URL', async () => {
      const result = await service.extractThumbnails(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );
      expect(result.platform).toBe('youtube');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.thumbnails.maxres).toContain('dQw4w9WgXcQ');
    });

    it('should extract thumbnails from short URL', async () => {
      const result = await service.extractThumbnails(
        'https://youtu.be/dQw4w9WgXcQ',
      );
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should extract thumbnails from embed URL', async () => {
      const result = await service.extractThumbnails(
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      );
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should reject invalid YouTube video ID length', async () => {
      await expect(
        service.extractThumbnails('https://www.youtube.com/watch?v=abc'),
      ).rejects.toThrow(HttpException);
    });

    it('should reject invalid YouTube URL', async () => {
      await expect(
        service.extractThumbnails('https://www.youtube.com/channel/something'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Bilibili', () => {
    it('should extract thumbnails from BV URL', async () => {
      // Mock Bilibili API response
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 0,
          data: {
            pic: 'http://i0.hdslb.com/bfs/archive/test.jpg',
          },
        }),
      } as unknown as Response);

      const result = await service.extractThumbnails(
        'https://www.bilibili.com/video/BV1xx411c7mD',
      );
      expect(result.platform).toBe('bilibili');
      expect(result.videoId).toBe('BV1xx411c7mD');
      expect(result.thumbnails.maxres).toBeTruthy();
    });

    it('should reject invalid Bilibili URL', async () => {
      await expect(
        service.extractThumbnails('https://www.bilibili.com/bangumi/something'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Unsupported platforms', () => {
    it('should reject unsupported platform', async () => {
      await expect(
        service.extractThumbnails('https://www.vimeo.com/12345'),
      ).rejects.toThrow(HttpException);
    });

    it('should reject random URL', async () => {
      await expect(
        service.extractThumbnails('https://www.google.com'),
      ).rejects.toThrow(HttpException);
    });
  });
});
