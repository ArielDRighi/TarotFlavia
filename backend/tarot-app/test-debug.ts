import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './src/app.module';

async function main() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  // Test readings endpoint
  const res = await request(app.getHttpServer())
    .post('/readings')
    .set('Authorization', 'Bearer fake-token')
    .send({ test: 'data' });
    
  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2));
  
  await app.close();
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
