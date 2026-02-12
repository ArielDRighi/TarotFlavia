import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedBirthChartInterpretations } from '../../../../database/seeds/birth-chart-interpretations.seeder';

@Injectable()
export class BirthChartInterpretationsSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await seedBirthChartInterpretations(this.dataSource);
  }
}
