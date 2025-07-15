#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 准备发布 Prompt Format MCP');
console.log('=' .repeat(50));

// 1. 检查必要文件
console.log('\n📋 1. 检查必要文件...');
const requiredFiles = [
  'package.json',
  'README.md',
  'dist/index.js',
  'dist/server.js',
  '.env.example'
];

for (const file of requiredFiles) {
  try {
    const content = readFileSync(file, 'utf8');
    console.log(`✅ ${file} 存在`);
  } catch (error) {
    console.log(`❌ ${file} 不存在或无法读取`);
    process.exit(1);
  }
}

// 2. 运行测试
console.log('\n🧪 2. 运行测试...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ 测试通过');
} catch (error) {
  console.log('❌ 测试失败');
  process.exit(1);
}

// 3. 构建项目
console.log('\n🔨 3. 构建项目...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 构建成功');
} catch (error) {
  console.log('❌ 构建失败');
  process.exit(1);
}

// 4. 检查package.json
console.log('\n📦 4. 检查package.json...');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

const requiredFields = ['name', 'version', 'description', 'main', 'bin'];
for (const field of requiredFields) {
  if (!packageJson[field]) {
    console.log(`❌ package.json 缺少必要字段: ${field}`);
    process.exit(1);
  }
}
console.log('✅ package.json 检查通过');

// 5. 检查npm登录状态
console.log('\n🔐 5. 检查npm登录状态...');
try {
  const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
  console.log(`✅ 已登录npm，用户: ${whoami}`);
} catch (error) {
  console.log('❌ 未登录npm');
  console.log('请运行以下命令登录:');
  console.log('npm login');
  process.exit(1);
}

// 6. 检查包名是否可用
console.log('\n🔍 6. 检查包名是否可用...');
try {
  execSync(`npm view ${packageJson.name}`, { stdio: 'pipe' });
  console.log(`⚠️  包名 ${packageJson.name} 已存在`);
  console.log('你可能需要更改包名或更新版本号');
} catch (error) {
  console.log(`✅ 包名 ${packageJson.name} 可用`);
}

// 7. 显示即将发布的内容
console.log('\n📄 7. 即将发布的内容:');
try {
  const packOutput = execSync('npm pack --dry-run', { encoding: 'utf8' });
  console.log(packOutput);
} catch (error) {
  console.log('❌ 无法生成包预览');
}

console.log('\n🎉 发布准备完成！');
console.log('\n📝 发布步骤:');
console.log('1. 确认所有信息正确');
console.log('2. 运行: npm publish');
console.log('3. 等待发布完成');
console.log('4. 验证发布: npm view prompt-format-mcp');

console.log('\n💡 使用提示:');
console.log('发布后用户可以通过以下方式使用:');
console.log('- 全局安装: npm install -g prompt-format-mcp');
console.log('- 直接使用: npx prompt-format-mcp');
console.log('- 在Cursor中配置MCP服务器'); 