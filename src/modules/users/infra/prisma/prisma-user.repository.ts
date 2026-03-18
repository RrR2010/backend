import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/infra/prisma/prisma.service';
import { UserRepository } from '@modules/users/domain/repositories/user.repository';
import { User } from '@modules/users/domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';
import { PrismaUserMapper } from '@modules/users/infra/prisma/user-mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const bdUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!bdUser) return null;
    return PrismaUserMapper.toDomain(bdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const bdUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!bdUser) return null;
    return PrismaUserMapper.toDomain(bdUser);
  }

  async findByName(name: string): Promise<User[]> {
    const bdUsers: PrismaUser[] = await this.prisma.user.findMany({
      where: { name },
    });
    return bdUsers.map((bdUser) => PrismaUserMapper.toDomain(bdUser));
  }

  async findAll(): Promise<User[]> {
    const bdUsers: PrismaUser[] = await this.prisma.user.findMany({
      where: {},
    });
    return bdUsers.map((bdUser) => PrismaUserMapper.toDomain(bdUser));
  }

  async save(user: User): Promise<User> {
    const bdUser = PrismaUserMapper.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: bdUser.id },
      update: bdUser,
      create: bdUser,
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    return this.prisma.user.delete({ where: { id } }).then(() => {});
  }
}
