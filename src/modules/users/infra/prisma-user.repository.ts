import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import { User } from '@modules/users/domain/user.entity';
import { PrismaUserMapper } from '@modules/users/infra/user-mapper';
import { UserRepository } from '@modules/users/domain/user.repository';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!prismaUser) return null;
    return PrismaUserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!prismaUser) return null;
    return PrismaUserMapper.toDomain(prismaUser);
  }

  async findByName(name: string): Promise<User[]> {
    const prismaUsers: PrismaUser[] = await this.prisma.user.findMany({
      where: { name },
    });
    return prismaUsers.map((prismaUser) =>
      PrismaUserMapper.toDomain(prismaUser),
    );
  }

  async findAll(): Promise<User[]> {
    const prismaUsers: PrismaUser[] = await this.prisma.user.findMany({
      where: {},
    });
    return prismaUsers.map((prismaUser) =>
      PrismaUserMapper.toDomain(prismaUser),
    );
  }

  async save(user: User): Promise<User> {
    const prismaUser = PrismaUserMapper.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: prismaUser.id },
      update: prismaUser,
      create: prismaUser,
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    return this.prisma.user.delete({ where: { id } }).then(() => {});
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
