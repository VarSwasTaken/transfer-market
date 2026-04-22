import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateContractInput = {
  playerId: number;
  startDate: string;
  endDate: string;
  salary: string | number;
  releaseClause?: string | number | null;
};

type UpdateContractInput = Partial<CreateContractInput>;

type ContractWriteResult = {
  id: number;
  playerId: number;
  startDate: string;
  endDate: string;
  salary: string;
  releaseClause: string | null;
  createdAt: string;
  updatedAt: string;
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

function mapContract(contract: {
  id: number;
  playerId: number;
  startDate: Date;
  endDate: Date;
  salary: Prisma.Decimal;
  releaseClause: Prisma.Decimal | null;
  createdAt: Date;
  updatedAt: Date;
}): ContractWriteResult {
  return {
    id: contract.id,
    playerId: contract.playerId,
    startDate: contract.startDate.toISOString(),
    endDate: contract.endDate.toISOString(),
    salary: contract.salary.toString(),
    releaseClause: contract.releaseClause?.toString() ?? null,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
  };
}

export async function createContract(input: CreateContractInput): Promise<ContractWriteResult> {
  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);

  if (endDate <= startDate) {
    throw new Error("endDate must be later than startDate.");
  }

  const salary = toDecimal(input.salary);
  if (salary.lt(0)) {
    throw new Error("salary must be non-negative.");
  }

  const playerExists = await prisma.player.findUnique({
    where: { id: input.playerId },
    select: { id: true },
  });

  if (!playerExists) {
    throw new Error("Player not found.");
  }

  const created = await prisma.contract.create({
    data: {
      playerId: input.playerId,
      startDate,
      endDate,
      salary,
      releaseClause:
        input.releaseClause === undefined || input.releaseClause === null
          ? null
          : toDecimal(input.releaseClause),
    },
  });

  return mapContract(created);
}

export async function updateContract(
  id: number,
  input: UpdateContractInput,
): Promise<ContractWriteResult | null> {
  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const startDate =
    input.startDate !== undefined ? parseDate(input.startDate) : existing.startDate;
  const endDate = input.endDate !== undefined ? parseDate(input.endDate) : existing.endDate;

  if (endDate <= startDate) {
    throw new Error("endDate must be later than startDate.");
  }

  if (input.playerId !== undefined) {
    const playerExists = await prisma.player.findUnique({
      where: { id: input.playerId },
      select: { id: true },
    });

    if (!playerExists) {
      throw new Error("Player not found.");
    }
  }

  const salary =
    input.salary !== undefined ? toDecimal(input.salary) : existing.salary;

  if (salary.lt(0)) {
    throw new Error("salary must be non-negative.");
  }

  if (input.releaseClause !== undefined && input.releaseClause !== null) {
    const releaseClause = toDecimal(input.releaseClause);
    if (releaseClause.lt(0)) {
      throw new Error("releaseClause must be non-negative.");
    }
  }

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      playerId: input.playerId,
      startDate: input.startDate !== undefined ? startDate : undefined,
      endDate: input.endDate !== undefined ? endDate : undefined,
      salary: input.salary !== undefined ? salary : undefined,
      releaseClause:
        input.releaseClause === undefined
          ? undefined
          : input.releaseClause === null
            ? null
            : toDecimal(input.releaseClause),
    },
  });

  return mapContract(updated);
}

export async function deleteContract(id: number): Promise<boolean | null> {
  const existing = await prisma.contract.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  await prisma.contract.delete({ where: { id } });
  return true;
}
