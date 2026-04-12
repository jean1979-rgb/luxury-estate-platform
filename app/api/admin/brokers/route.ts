import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "BROKER",
      },
      include: {
        brokerProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const propertyCounts = await Promise.all(
      users.map(async (user: any) => {
        const count = await prisma.brokerProperty.count({
          where: { ownerBrokerId: user.id },
        });

        return [user.id, count] as const;
      })
    );

    const countMap = new Map(propertyCounts);

    const items = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      propertyCount: countMap.get(user.id) ?? 0,
      brokerProfile: user.brokerProfile
        ? {
            id: user.brokerProfile.id,
            businessName: user.brokerProfile.businessName,
            slug: user.brokerProfile.slug,
            phone: user.brokerProfile.phone,
            city: user.brokerProfile.city,
            approved: user.brokerProfile.approved,
            canPublish: user.brokerProfile.canPublish,
            tokkoEnabled: user.brokerProfile.tokkoEnabled,
            tokkoLastSyncAt: user.brokerProfile.tokkoLastSyncAt,
            createdAt: user.brokerProfile.createdAt,
            updatedAt: user.brokerProfile.updatedAt,
          }
        : null,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/admin/brokers", error);
    return NextResponse.json(
      { ok: false, message: "No se pudieron cargar los brokers." },
      { status: 500 }
    );
  }
}
