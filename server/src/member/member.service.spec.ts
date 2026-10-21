import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('MemberService', () => {
  let service: MemberService;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    borrowRecord: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated members with borrow counts', async () => {
      mockPrismaService.user.count.mockResolvedValue(1);
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 1,
          username: 'member1',
          email: 'member1@example.com',
          fullName: 'Nguyễn Văn A',
          phone: '0912345678',
          memberCode: 'MB001',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { borrowRecords: 3 },
          borrowRecords: [{ id: 10, dueDate: new Date(Date.now() + 86400000) }],
        },
      ]);

      const result = await service.findAll({ page: 1, limit: 10, status: 'all' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].username).toBe('member1');
      expect(result.data[0].borrowingCount).toBe(1);
      expect(result.data[0].overdueCount).toBe(0);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return member detail with stats', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 1,
        username: 'member1',
        email: 'member1@example.com',
        fullName: 'Nguyễn Văn A',
        memberCode: 'MB001',
        isActive: true,
      });
      mockPrismaService.borrowRecord.count.mockResolvedValue(2);

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(result.stats.totalBorrows).toBe(2);
      expect(result.stats.borrowingCount).toBe(2);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update active status for member', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 1,
        role: Role.MEMBER,
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: 1,
        isActive: false,
      });

      const result = await service.updateStatus(1, false);

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
        select: expect.any(Object),
      });
    });

    it('should throw BadRequestException if user is not a MEMBER', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 2,
        role: Role.STAFF,
      });

      await expect(service.updateStatus(2, false)).rejects.toThrow(BadRequestException);
    });
  });
});
