/**
 * 标题生成器API测试脚本
 * 使用方法: node test-headline-api.js
 */

const testHeadlineAPI = async () => {
  const apiUrl = 'http://localhost:3001/api/headlines/generate';
  
  // 测试数据
  const testData = {
    topic: '如何学习JavaScript编程',
    keywords: 'JavaScript, 编程, 学习',
    platform: 'youtube',
    tone: 'informative',
    count: 5
  };

  console.log('🧪 开始测试标题生成器API...');
  console.log('📝 测试数据:', JSON.stringify(testData, null, 2));
  console.log('\n🔄 发送请求到:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📊 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API请求失败:', errorText);
      return;
    }

    const result = await response.json();
    console.log('\n✅ API响应成功!');
    console.log('🎯 生成的标题:');
    result.headlines.forEach((headline, index) => {
      console.log(`  ${index + 1}. ${headline}`);
    });
    
    console.log('\n📋 响应详情:');
    console.log('⏰ 生成时间:', result.timestamp);
    console.log('⚙️ 使用参数:', JSON.stringify(result.parameters, null, 2));
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保后端服务正在运行');
      console.log('   启动命令: cd backend && pnpm run start:dev');
    }
  }
};

// 健康检查测试
const testHealthCheck = async () => {
  const healthUrl = 'http://localhost:3001/api/headlines/health';
  
  console.log('\n🏥 测试健康检查接口...');
  
  try {
    const response = await fetch(healthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 健康检查通过:', result);
    } else {
      console.log('❌ 健康检查失败:', response.status);
    }
  } catch (error) {
    console.log('❌ 健康检查错误:', error.message);
  }
};

// 运行测试
const runTests = async () => {
  console.log('🚀 标题生成器API测试开始\n');
  console.log('=' .repeat(50));
  
  await testHealthCheck();
  await testHeadlineAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 测试完成!');
  
  console.log('\n📝 注意事项:');
  console.log('1. 如果看到"OpenAI API密钥未配置"错误，请在.env文件中设置OPENAI_API_KEY');
  console.log('2. 确保后端服务在http://localhost:3001运行');
  console.log('3. 检查网络连接是否正常');
};

// 执行测试
runTests().catch(console.error);