import prisma from '../config/database.js';

/**
 * Get business settings (singleton).
 */
export const getSettings = async () => {
  let settings = await prisma.businessSettings.findUnique({
    where: { id: 'singleton' },
  });

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: { id: 'singleton' },
    });
  }

  return settings;
};

/**
 * Update business settings.
 */
export const updateSettings = async (data) => {
  return prisma.businessSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });
};

/**
 * List delivery zones.
 */
export const getDeliveryZones = async () => {
  return prisma.deliveryZone.findMany({
    orderBy: { sortOrder: 'asc' },
  });
};

/**
 * Update delivery zones (replace all).
 */
export const updateDeliveryZones = async (zones) => {
  return prisma.$transaction(async (tx) => {
    // Delete all existing zones
    await tx.deliveryZone.deleteMany();

    // Create new zones
    const created = await Promise.all(
      zones.map((zone, index) =>
        tx.deliveryZone.create({
          data: {
            name: zone.name,
            fee: parseFloat(zone.fee),
            description: zone.description || '',
            sortOrder: index,
          },
        })
      )
    );

    return created;
  });
};
