import { Prisma, TransferType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateTransferContractInput = {
  startDate: string;
  endDate: string;
  salary: string | number;
  releaseClause?: string | number | null;
};

type CreateTransferInput = {
  playerId: number;
  toClubId: number;
  fee: string | number;
  transferType?: TransferType;
  date?: string;
  fromClubId?: number | null;
  contract?: CreateTransferContractInput | null;
};

type UpdateTransferInput = {
  fee?: string | number;
  transferType?: TransferType;
  date?: string;
};

type TransferWriteResult = {
  id: number;
  playerId: number;
  fromClubId: number | null;
  toClubId: number;
  fee: string;
  transferType: TransferType;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type CreateTransferResult = {
  transfer: TransferWriteResult;
  contractId: number | null;
};

function toDecimal(value: string | number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

function parseDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format.");
  }
  return parsed;
}

function mapTransfer(transfer: {
  id: number;
  playerId: number;
  fromClubId: number | null;
  toClubId: number;
  fee: Prisma.Decimal;
  transferType: TransferType;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}): TransferWriteResult {
  return {
    id: transfer.id,
    playerId: transfer.playerId,
    fromClubId: transfer.fromClubId,
    toClubId: transfer.toClubId,
    fee: transfer.fee.toString(),
    transferType: transfer.transferType,
    date: transfer.date.toISOString(),
    createdAt: transfer.createdAt.toISOString(),
    updatedAt: transfer.updatedAt.toISOString(),
  };
}

export async function createTransfer(input: CreateTransferInput): Promise<CreateTransferResult> {
  const fee = toDecimal(input.fee);
  if (fee.lt(0)) {
    throw new Error("fee must be non-negative.");
  }

  const transferDate = input.date ? parseDate(input.date) : new Date();

  const result = await prisma.$transaction(async (tx) => {
    const player = await tx.player.findUnique({
      where: { id: input.playerId },
      select: { id: true, clubId: true },
    });

    if (!player) {
      throw new Error("Player not found.");
    }

    const toClub = await tx.club.findUnique({
      where: { id: input.toClubId },
      select: { id: true },
    });

    if (!toClub) {
      throw new Error("Destination club not found.");
    }

    const fromClubId = input.fromClubId === undefined ? player.clubId : input.fromClubId;

    if (fromClubId !== null) {
      const fromClub = await tx.club.findUnique({
        where: { id: fromClubId },
        select: { id: true },
      });

      if (!fromClub) {
        throw new Error("Origin club not found.");
      }
    }

    if (fromClubId !== null && fromClubId === input.toClubId) {
      throw new Error("fromClubId and toClubId cannot be the same.");
    }

    const transfer = await tx.transfer.create({
      data: {
        playerId: input.playerId,
        fromClubId,
        toClubId: input.toClubId,
        fee,
        transferType: input.transferType ?? TransferType.PERMANENT,
        date: transferDate,
      },
    });

    if (fee.gt(0)) {
      await tx.club.update({
        where: { id: input.toClubId },
        data: {
          budget: {
            decrement: fee,
          },
        },
      });

      if (fromClubId !== null) {
        await tx.club.update({
          where: { id: fromClubId },
          data: {
            budget: {
              increment: fee,
            },
          },
        });
      }
    }

    await tx.player.update({
      where: { id: input.playerId },
      data: {
        clubId: input.toClubId,
      },
    });

    let contractId: number | null = null;

    if (input.contract) {
      const contractStartDate = parseDate(input.contract.startDate);
      const contractEndDate = parseDate(input.contract.endDate);

      if (contractEndDate <= contractStartDate) {
        throw new Error("contract.endDate must be later than contract.startDate.");
      }

      const contractSalary = toDecimal(input.contract.salary);
      if (contractSalary.lt(0)) {
        throw new Error("contract.salary must be non-negative.");
      }

      if (
        input.contract.releaseClause !== undefined &&
        input.contract.releaseClause !== null &&
        toDecimal(input.contract.releaseClause).lt(0)
      ) {
        throw new Error("contract.releaseClause must be non-negative.");
      }

      const contract = await tx.contract.create({
        data: {
          playerId: input.playerId,
          startDate: contractStartDate,
          endDate: contractEndDate,
          salary: contractSalary,
          releaseClause:
            input.contract.releaseClause === undefined || input.contract.releaseClause === null
              ? null
              : toDecimal(input.contract.releaseClause),
        },
      });

      contractId = contract.id;
    }

    return {
      transfer,
      contractId,
    };
  });

  return {
    transfer: mapTransfer(result.transfer),
    contractId: result.contractId,
  };
}

export async function updateTransfer(
  id: number,
  input: UpdateTransferInput,
): Promise<TransferWriteResult | null> {
  const existing = await prisma.transfer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const fee = input.fee !== undefined ? toDecimal(input.fee) : undefined;
  if (fee && fee.lt(0)) {
    throw new Error("fee must be non-negative.");
  }

  const updated = await prisma.transfer.update({
    where: { id },
    data: {
      fee,
      transferType: input.transferType,
      date: input.date ? parseDate(input.date) : undefined,
    },
  });

  return mapTransfer(updated);
}

export async function deleteTransfer(id: number): Promise<boolean | null> {
  const existing = await prisma.transfer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  await prisma.transfer.delete({ where: { id } });
  return true;
}
