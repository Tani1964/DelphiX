import { getSOSEventsCollection, getUsersCollection } from './mongodb';
import { findNearbyHospitals } from './maps';
import { SOSEvent, User } from '@/types';
import { ObjectId } from 'mongodb';

export async function activateSOS(userId: string): Promise<SOSEvent> {
  const sosEvents = await getSOSEventsCollection();

  // Check if there's an active SOS event
  const activeEvent = await sosEvents.findOne({
    userId,
    status: 'active',
  });

  if (activeEvent) {
    return activeEvent as unknown as SOSEvent;
  }

  // Create new SOS event
  const newEvent: Omit<SOSEvent, '_id'> = {
    userId,
    activatedAt: new Date(),
    status: 'active',
    lastActivityCheck: new Date(),
    emergencyContactsNotified: [],
    hospitalsNotified: [],
  };

  const result = await sosEvents.insertOne(newEvent);
  return {
    ...newEvent,
    _id: result.insertedId.toString(),
  } as SOSEvent;
}

export async function updateSOSActivity(userId: string): Promise<void> {
  const sosEvents = await getSOSEventsCollection();
  await sosEvents.updateOne(
    { userId, status: 'active' },
    {
      $set: {
        lastActivityCheck: new Date(),
      },
    }
  );
}

export async function checkSOSInactivity(): Promise<void> {
  const sosEvents = await getSOSEventsCollection();
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  // Find active SOS events with no recent activity
  const inactiveEvents = await sosEvents
    .find({
      status: 'active',
      $or: [
        { lastActivityCheck: { $lt: twoMinutesAgo } },
        { lastActivityCheck: { $exists: false } },
      ],
    })
    .toArray();

  for (const event of inactiveEvents) {
    await requestHelp(event as unknown as SOSEvent);
  }
}

async function requestHelp(event: SOSEvent): Promise<void> {
  const sosEvents = await getSOSEventsCollection();
  const users = await getUsersCollection();

  const user = await users.findOne({ _id: new ObjectId(event.userId) }) as User | null;

  if (!user) {
    return;
  }

  // Notify emergency contacts
  const notifiedContacts: string[] = [];
  if (user.emergencyContacts && user.emergencyContacts.length > 0) {
    for (const contact of user.emergencyContacts) {
      // In production, send SMS/email here
      // For now, just log
      console.log(`SOS Alert: Notifying ${contact.name} at ${contact.phone}`);
      notifiedContacts.push(contact._id || contact.name);
    }
  }

  // Find and notify nearby hospitals
  const notifiedHospitals: string[] = [];
  if (user.location) {
    try {
      const hospitals = await findNearbyHospitals(
        user.location.lat,
        user.location.lng,
        5000
      );

      for (const hospital of hospitals.slice(0, 3)) {
        // In production, send alert to hospital
        console.log(`SOS Alert: Notifying ${hospital.name}`);
        notifiedHospitals.push(hospital.placeId || hospital.name);
      }
    } catch (error) {
      console.error('Error finding hospitals for SOS:', error);
    }
  }

  // Update SOS event
  await sosEvents.updateOne(
    { _id: new ObjectId(event._id) },
    {
      $set: {
        helpRequestedAt: new Date(),
        emergencyContactsNotified: notifiedContacts,
        hospitalsNotified: notifiedHospitals,
      },
    }
  );
}

export async function resolveSOS(userId: string): Promise<void> {
  const sosEvents = await getSOSEventsCollection();
  await sosEvents.updateOne(
    { userId, status: 'active' },
    {
      $set: {
        status: 'resolved',
        resolvedAt: new Date(),
      },
    }
  );
}

export async function getActiveSOS(userId: string): Promise<SOSEvent | null> {
  const sosEvents = await getSOSEventsCollection();
  return (await sosEvents.findOne({
    userId,
    status: 'active',
  })) as SOSEvent | null;
}

