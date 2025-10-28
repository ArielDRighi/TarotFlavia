import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TarotReading } from '../../readings/entities/tarot-reading.entity';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email único del usuario',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'https://ejemplo.com/foto.jpg',
    description: 'URL de la foto de perfil',
  })
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario tiene permisos de administrador',
  })
  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => TarotReading, (reading) => reading.user)
  readings: TarotReading[];

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación del usuario',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de última actualización del usuario',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
