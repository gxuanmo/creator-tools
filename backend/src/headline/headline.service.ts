import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { GenerateHeadlineDto, HeadlineResponseDto } from './dto/generate-headline.dto';

/**
 * 标题生成器服务
 */
@Injectable()
export class HeadlineService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 生成标题
   * @param {GenerateHeadlineDto} dto - 生成标题的请求参数
   * @returns {Promise<HeadlineResponseDto>} 生成的标题响应
   */
  async generateHeadlines(dto: GenerateHeadlineDto): Promise<HeadlineResponseDto> {
    const apiKey = this.configService.openaiApiKey;
    
    if (!apiKey) {
      throw new BadRequestException('OpenAI API密钥未配置，请检查环境变量OPENAI_API_KEY');
    }

    try {
      // 构建提示词
      const prompt = this.buildPrompt(dto);
      
      // 调用OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的内容创作助手，擅长为不同平台生成吸引人的标题。请根据用户的要求生成标题，每个标题单独一行。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API错误: ${errorData.error?.message || '未知错误'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // 解析生成的标题
      const headlines = this.parseHeadlines(content, dto.count || 5);
      
      return {
        headlines,
        timestamp: new Date().toISOString(),
        parameters: {
          topic: dto.topic,
          keywords: dto.keywords,
          platform: dto.platform,
          tone: dto.tone,
          count: dto.count || 5,
        },
      };
    } catch (error) {
      console.error('标题生成失败:', error);
      throw new BadRequestException(`标题生成失败: ${error.message}`);
    }
  }

  /**
   * 构建OpenAI提示词
   * @param {GenerateHeadlineDto} dto - 请求参数
   * @returns {string} 构建的提示词
   */
  private buildPrompt(dto: GenerateHeadlineDto): string {
    let prompt = `请为以下主题生成${dto.count || 5}个吸引人的标题:\n\n主题: ${dto.topic}`;
    
    if (dto.keywords) {
      prompt += `\n关键词: ${dto.keywords}`;
    }
    
    if (dto.platform) {
      const platformTips = {
        youtube: '适合YouTube视频，需要吸引点击',
        tiktok: '适合TikTok短视频，要简洁有趣',
        instagram: '适合Instagram帖子，要有视觉冲击力',
        twitter: '适合Twitter推文，要简短精炼',
        blog: '适合博客文章，要专业且有信息量',
        general: '通用标题，平衡吸引力和信息性',
      };
      prompt += `\n平台: ${dto.platform} (${platformTips[dto.platform] || '通用平台'})`;
    }
    
    if (dto.tone) {
      const toneTips = {
        professional: '专业严肃的语调',
        casual: '轻松随意的语调',
        humorous: '幽默风趣的语调',
        dramatic: '戏剧化吸引眼球的语调',
        informative: '信息丰富的语调',
      };
      prompt += `\n语调: ${toneTips[dto.tone] || '自然语调'}`;
    }
    
    prompt += '\n\n请生成标题，每个标题单独一行，不要添加序号或其他格式。';
    
    return prompt;
  }

  /**
   * 解析OpenAI返回的标题文本
   * @param {string} content - OpenAI返回的内容
   * @param {number} count - 期望的标题数量
   * @returns {string[]} 解析后的标题数组
   */
  private parseHeadlines(content: string, count: number): string[] {
    // 按行分割并清理
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // 移除可能的序号前缀
        return line.replace(/^\d+[.)\s]+/, '').trim();
      })
      .filter(line => line.length > 0);
    
    // 返回指定数量的标题
    return lines.slice(0, count);
  }
}